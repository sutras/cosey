import { cssObjectToString } from '../css';
import { escapeHtml } from './utils';
import { WorkBook } from './workBook';

/**
 * 将 WorkSheet 转换为 html 字符串
 */
export function wb2html(wb: WorkBook) {
  const ws = wb.sheets[0];

  const thead = Array.from({ length: ws.headRowCount })
    .map((_, idx) => {
      return `<tr>${ws.sheet[idx]
        .filter((cell) => !cell.isEmpty)
        .map((cell) => {
          return `<th rowspan="${cell.rowSpan}" colspan="${cell.colSpan}">${escapeHtml(cell.value)}</th>`;
        })
        .join('')}</tr>`;
    })
    .join('');

  const tbody = Array.from({
    length: ws.sheet.length - ws.headRowCount,
  })
    .map((_, idx) => {
      return `<tr>${ws.sheet[idx + ws.headRowCount]
        .map((cell) => {
          return `<td>${escapeHtml(cell.value)}</td>`;
        })
        .join('')}</tr>`;
    })
    .join('');

  const style = cssObjectToString({
    body: {
      margin: 0,
      fontSize: '14px',
      color: '#303133',
    },
    table: {
      width: '100%',
      tableLayout: 'fixed',
      borderCollapse: 'collapse',
    },
    'th,td': {
      padding: '8px',
      wordBreak: 'break-all',
      border: '1px solid #dcdfe6',
      textAlign: 'center',
    },
    th: {
      backgroundColor: '#f5f7fa',
    },
  });

  return [
    '<!doctype html><html><head><meta charset="utf-8"/><title>Export</title>',
    `<style>${style}</style>`,
    '</head><body><table>',
    `<thead>${thead}</thead>`,
    `<tbody>${tbody}</tbody>`,
    '</table></body></html>',
  ].join('');
}
