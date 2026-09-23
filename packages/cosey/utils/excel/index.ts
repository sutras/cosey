import { getExtByBookType, getMimeByBookType, bookFormats } from './bookFormats';
import type { ExportBookType, ExportExcelScheme } from './type';
import { aoa2sheet } from './utils';
import { Cell, WorkBook } from './workBook';
import { wb2html } from './html';
import { wb2xlsx } from './xlsx';
import { wb2xml } from './xml';
import { wb2csv } from './csv';
import { wb2txt } from './txt';
import { type MayBeTableColumnProps, type TableColumnProps } from '../../components';
import { isObject } from '../is';
import { createBlob, downloadBlob } from '../file';

/**
 * 需要写 BOM 的纯文本格式
 *
 * 不带 BOM 的 UTF-8 csv/txt 在 Windows 版 Excel、WPS 里会被按 GBK 解码，中文必然乱码，
 * 加 BOM 是最省事且各端都认的解法。序列化函数本身保持纯净，BOM 只在写文件这层加。
 */
const BOM_BOOK_TYPES: ExportBookType[] = ['csv', 'txt'];

/**
 * 根据字符串下载文件
 */
function downloadByString(string: string, filename: string, mimeType: string) {
  downloadBlob(createBlob(string, mimeType), filename);
}

/**
 * 写入本地文件
 */
async function writeFile(wb: WorkBook, bookType: ExportBookType) {
  const mime = getMimeByBookType(bookType);

  if (bookType === 'xlsx') {
    const blob = await wb2xlsx(wb, mime);
    downloadBlob(blob, wb.name);
    return;
  }

  let content = '';

  switch (bookType) {
    case 'csv':
      content = wb2csv(wb);
      break;
    case 'txt':
      content = wb2txt(wb);
      break;
    case 'xml':
      content = wb2xml(wb);
      break;
    case 'html':
      content = wb2html(wb);
      break;
  }

  if (BOM_BOOK_TYPES.includes(bookType)) {
    content = '\ufeff' + content;
  }

  downloadByString(content, wb.name, `${mime};charset=utf-8`);
}

/**
 * 剔除无效列，并递归丢弃子列被剔光的组
 *
 * 表头（columns2aoa）与数据行（flatColumns）对「哪些列可见」必须有一致的定义：
 * flatColumns 会丢掉非对象项、并把空的分组展平成 0 列，所以表头拿到的也必须是同一棵修剪后的树，
 * 否则表头会多出格、整行错位（例如分组列的子列全被取消勾选时）。
 */
export function pruneColumns(columns: MayBeTableColumnProps[]): TableColumnProps[] {
  return columns.reduce((result, column) => {
    if (!isObject(column)) {
      return result;
    }

    if (Array.isArray(column.columns)) {
      const children = pruneColumns(column.columns);
      // 子列被剔光的组在数据侧是 0 列，表头也不能留
      if (children.length) {
        result.push({ ...column, columns: children });
      }
      return result;
    }

    result.push(column);
    return result;
  }, [] as TableColumnProps[]);
}

/**
 * 只取最底层的列组成表头
 */
export function flatColumns(columns: MayBeTableColumnProps[]) {
  return columns
    .reduce((result, column): MayBeTableColumnProps[] => {
      return result.concat(
        isObject(column) && Array.isArray(column.columns) ? flatColumns(column.columns) : column,
      );
    }, [] as MayBeTableColumnProps[])
    .filter(isObject) as TableColumnProps[];
}

/**
 * 将 columns 转换为二维数组
 */
function columns2aoa(columns: TableColumnProps[]) {
  let aoa: Cell[][] = [];

  let colIndex = 0;
  function recurColumns(columns: TableColumnProps[], rowIndex = 0) {
    const row = (aoa[rowIndex] ??= []);

    let mergedColSpan = 0;

    const children = columns.map((column, index) => {
      const cell = new Cell(column.label);
      cell.colIndex = colIndex;
      cell.rowIndex = rowIndex;
      cell.isHeader = true;
      row[colIndex] = cell;

      let colSpan = 1;
      if (column.columns?.length) {
        const result = recurColumns(column.columns, rowIndex + 1);
        colSpan = result.mergedColSpan;
        cell.children = result.children;
      }

      cell.colSpan = colSpan;

      mergedColSpan += colSpan;

      if (index !== columns.length - 1) {
        colIndex++;
      }
      return cell;
    });

    return {
      mergedColSpan,
      children,
    };
  }

  recurColumns(columns);

  const rowCount = aoa.length;

  if (rowCount > 1) {
    aoa.forEach((row, rowIndex) => {
      row.forEach((cell) => {
        cell.rowSpan = cell.children ? 1 : rowCount - rowIndex;
      });
    });

    aoa = aoa.map((row) => {
      return [...row].map((cell) => {
        if (!cell) {
          cell = new Cell();
          cell.isEmpty = true;
          cell.isHeader = true;
        }
        return cell;
      });
    });
  }

  return aoa;
}

/**
 * 将 columns 最后一级转换为二维数组
 */
function columns2lastLevelAoa(columns: TableColumnProps[]) {
  return [
    columns.map((column) => {
      const cell = new Cell(column.label);
      cell.isHeader = true;
      return cell;
    }),
  ];
}

export interface ExportExcelOptions {
  footerCount?: number;
}

/**
 * 根据数据和配置，导出 excel 文件
 */
async function exportExcel(
  scheme: ExportExcelScheme,
  data:
    | Record<string, any>[]
    | {
        [sheetName: string]: Record<string, any>[];
      },
  options?: ExportExcelOptions,
) {
  const { footerCount = 0 } = options || {};
  const worksheets = scheme.worksheet ? [scheme.worksheet] : scheme.worksheets || [];

  if (!worksheets.length) {
    throw new Error('exportExcel: 需要提供 worksheet 或 worksheets');
  }

  const bookType = scheme.bookType || 'csv';
  const ext = getExtByBookType(bookType);
  const rawName = String(scheme.filename ?? '');
  // 调用方常常自己带上扩展名（"报表.xlsx"），别拼成 "报表.xlsx.csv"
  const filename = rawName.endsWith(ext) ? rawName : rawName + ext;

  const workBook = new WorkBook(filename);

  worksheets.forEach((sheet) => {
    const { name, columns, transform, noGroup, noHead } = sheet;

    // 表头与数据必须基于同一棵树，否则表头列数与数据列数会对不上
    const prunedColumns = pruneColumns(columns);
    const fColumns = flatColumns(prunedColumns);

    const ooa = Array.isArray(data) ? data : data?.[name];

    if (!Array.isArray(ooa)) {
      throw new Error(
        `exportExcel: 找不到工作表「${name}」的数据，data 需为数组或 { [sheetName]: 数组 }`,
      );
    }

    let aoa = ooa.map((obj, index) =>
      fColumns.map((column, colIndex) => {
        if (index < ooa.length - footerCount) {
          if (column.type === 'index') {
            return index + 1;
          } else {
            const value = obj[column.prop as string];
            return transform ? transform(obj, column, value, index) : value;
          }
        } else {
          return obj[colIndex];
        }
      }),
    );

    let headAoa: Cell[][] = [];
    if (!noHead) {
      headAoa = noGroup ? columns2lastLevelAoa(fColumns) : columns2aoa(prunedColumns);
      aoa = headAoa.concat(aoa);
    }

    const workSheet = aoa2sheet(name, aoa);

    workSheet.headRowCount = headAoa.length;

    workBook.addSheet(workSheet);
  });

  await writeFile(workBook, bookType);
}

export { bookFormats, exportExcel };

export type { ExportBookType, ExportExcelScheme };
