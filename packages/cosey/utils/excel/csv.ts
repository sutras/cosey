import { WorkBook } from './workBook';

const CRLF = '\r\n';

/** 会被 Excel / WPS 当成公式起始的字符 */
const FORMULA_LEADING = /^[=+\-@\t\r]/;

/** 纯数字形态的值（-42.5、+7、1e3）不该被当成公式，否则正常负数会被写成文本 */
const PLAIN_NUMBER = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;

/**
 * 让「看起来像公式」的值变成纯文本
 *
 * csv / txt 里以 = + - @ 开头的值，Excel / WPS 打开时会直接当公式执行
 * （=HYPERLINK(...) 之类可以顺手把数据外带）。前置单引号是「按文本处理」的标记，
 * Excel 里不会显示出来。
 */
export function escapeFormula(value: string) {
  if (!FORMULA_LEADING.test(value) || PLAIN_NUMBER.test(value)) {
    return value;
  }

  return `'${value}`;
}

/**
 * 将二维数组转换为 csv 字符串
 *
 * https://www.rfc-editor.org/rfc/rfc4180.html
 */
export function aoa2csv(aoa: string[][], FS = ',') {
  return aoa
    .map((fields) => {
      return fields
        .map((field) => {
          const value = escapeFormula(String(field)).replace(/"/g, '""');

          // 含分隔符、引号或换行（孤立的 \r 也算）时必须整个字段包起来
          const needsQuote = value.includes(FS) || /["\n\r]/.test(value);

          return needsQuote ? `"${value}"` : value;
        })
        .join(FS);
    })
    .join(CRLF);
}

/**
 * 将 WorkBook 转换为 csv 字符串
 */
export function wb2csv(wb: WorkBook) {
  const aoa = wb.sheets[0].sheet.map((row) => {
    return row.map((cell) => {
      return cell?.value ?? '';
    });
  });
  return aoa2csv(aoa);
}
