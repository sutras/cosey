import { escapeXml } from './utils';
import { WorkBook } from './workBook';

/**
 * 将 WorkBook 转换为 xml 字符串
 */
export function wb2xml(wb: WorkBook) {
  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Version>16.00</Version>
  </DocumentProperties>
  <ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel">
    <WindowHeight>7920</WindowHeight>
    <WindowWidth>21570</WindowWidth>
    <WindowTopX>32767</WindowTopX>
    <WindowTopY>32767</WindowTopY>
    <ProtectStructure>False</ProtectStructure>
    <ProtectWindows>False</ProtectWindows>
  </ExcelWorkbook>
  ${wb.sheets
    .map((ws) => {
      const sheet = ws.sheet;
      return `<Worksheet ss:Name="${escapeXml(ws.name)}">
    <Table>
      ${sheet
        .map((row) => {
          return `<Row>${row
            .filter((cell) => !cell.isEmpty)
            .map((cell) => {
              const mergeDown = cell.rowSpan > 1 ? cell.rowSpan - 1 : 0;
              const mergeAcross = cell.colSpan > 1 ? cell.colSpan - 1 : 0;
              const mergeDownAttr = mergeDown ? ` ss:MergeDown="${mergeDown}"` : '';
              const mergeAcrossAttr = mergeAcross ? ` ss:MergeAcross="${mergeAcross}"` : '';
              const indexAttr =
                cell.isHeader && cell.colIndex > -1 ? ` ss:Index="${cell.colIndex + 1}"` : '';
              return `<Cell${mergeDownAttr}${mergeAcrossAttr}${indexAttr}><Data ss:Type="String">${escapeXml(cell.value)}</Data></Cell>`;
            })
            .join('')}</Row>`;
        })
        .join('')}
    </Table>
  </Worksheet>`;
    })
    .join('')}
</Workbook>`;
}
