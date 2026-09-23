import type { CellAddress, Range } from './type';
import { Cell, WorkSheet } from './workBook';

/**
 * 将二维数组转换为 WorkSheet
 */
export function aoa2sheet(sheetName: string, aoa: any[][]) {
  const sheet = new WorkSheet(sheetName);

  aoa.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      const cell = value instanceof Cell ? value : new Cell(value);

      // 表头以外的单元格（数据行、合并占位）不会自带行列号，
      // 不补上的话序列化出的单元格引用会退化成非法的 "0"
      if (cell.colIndex < 0) cell.colIndex = colIndex;
      if (cell.rowIndex < 0) cell.rowIndex = rowIndex;

      sheet.setCell(colIndex, rowIndex, cell);
    });
  });

  return sheet;
}

/**
 * 将 A1-Style 列解码为下标列
 */
export function decodeCol(col: string) {
  let c = 0;
  for (let i = 0; i < col.length; i++) {
    c = 26 * c + (col.charCodeAt(i) - 64);
  }
  return c - 1;
}

/**
 * 将 A1-Style 行解码为下标行
 */
export function decodeRow(row: string) {
  return parseInt(row) - 1;
}

/**
 * 将 A1-Style 单元格地址解码为行列下标对象
 */
export function decodeCell(address: string): CellAddress {
  let r = 0;
  let c = 0;
  for (let i = 0; i < address.length; i++) {
    const cc = address.charCodeAt(i);
    if (cc >= 48 && cc <= 57) {
      r = 10 * r + (cc - 48);
    } else if (cc >= 65 && cc <= 90) {
      c = 26 * c + (cc - 64);
    }
  }
  return {
    r: r - 1,
    c: c - 1,
  };
}

/**
 * 将 A1-Style 范围解码为下标单元格范围
 */
export function decodeRange(range: string): Range {
  const idx = range.indexOf(':');
  if (idx === -1) {
    return {
      s: decodeCell(range),
      e: decodeCell(range),
    };
  }
  return {
    s: decodeCell(range.slice(0, idx)),
    e: decodeCell(range.slice(idx + 1)),
  };
}

/**
 * 将下标列编码为 A1-Style 列
 */
export function encodeCol(col: number) {
  if (!Number.isInteger(col) || col < 0) {
    throw new RangeError(`encodeCol 需要非负整数，收到 ${col}`);
  }

  // 是 26 进制的「双射」计数（没有 0 位，第 26 列是 Z 而不是 A@），
  // 所以每一位都要先减 1 再取模
  let c = '';

  for (let n = col + 1; n > 0; n = Math.floor((n - 1) / 26)) {
    c = String.fromCharCode(((n - 1) % 26) + 65) + c;
  }
  return c;
}

/**
 * 将下标行编码为 A1-Style 行
 */
export function encodeRow(row: number) {
  return '' + (row + 1);
}

/**
 * 将下标单元格对象编码为 A1-Style 单元格地址
 */
export function encodeCell(cell: CellAddress) {
  return encodeCol(cell.c) + encodeRow(cell.r);
}

/**
 * 将下标单元格范围编码为 A1-Style 范围
 */
export function encodeRange(range: Range) {
  return encodeCell(range.s) + ':' + encodeCell(range.e);
}

/**
 * 转义 xml 文本节点与属性值中的特殊字符
 */
export function escapeXml(value: any) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * 转义 html 文本节点中的特殊字符
 */
export function escapeHtml(value: any) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
