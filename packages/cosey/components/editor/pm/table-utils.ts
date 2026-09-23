import { schema } from './schema';

/** 建一个空单元格（表格的最小构造单元） */
export function createCell(type: 'table_cell' | 'table_header' = 'table_cell') {
  return schema.nodes[type].create(null, [schema.nodes.paragraph.create()]);
}

/** 按列数建一行 */
export function createRow(columns: number, cellType: 'table_cell' | 'table_header' = 'table_cell') {
  return schema.nodes.table_row.create(
    null,
    Array.from({ length: columns }, () => createCell(cellType)),
  );
}
