/**
 * utils/excel 回归测试
 *
 * 跑法：`pnpm test:excel`（即 `tsx ./packages/cosey/utils/excel/excel.test.ts`）
 *
 * 这里不追求覆盖率，只钉住「会导出非法文件 / 会让页面卡死」的几类边界：
 * 1. 单元格引用必须合法（历史 bug：数据格全是 r="0"，WPS 靠宽容度能开、预览器与 pandas 打不开）
 * 2. 前导零、18 位证件号、19 位订单号必须原样保留为文本
 * 3. 取消表头 + 空数据不能死循环
 * 4. 多 sheet 的标签名与内容不能错位
 * 5. csv / txt 要带 BOM
 * 6. xml / html 必须转义用户数据
 */
import assert from 'node:assert/strict';
import JSZip from 'jszip';

import { decodeCol, encodeCell, encodeCol, encodeRange } from './utils';
import { exportExcel, pruneColumns, type ExportExcelOptions } from './index';
import { aoa2csv, wb2csv } from './csv';
import { Cell, WorkBook, WorkSheet } from './workBook';
import type { ExportBookType, ExportExcelScheme, ExportExcelWorkSheet } from './type';
import type { TableColumnProps } from '../../components';

/* ------------------------------------------------------------------ 测试桩 */

interface Captured {
  filename: string;
  blob: Blob;
}

let downloads: Captured[] = [];
let lastBlob: Blob | undefined;

function installBrowserStubs() {
  const realSetTimeout = globalThis.setTimeout.bind(globalThis);

  // 下载后会挂一个 60s 的 revokeObjectURL 定时器，不拦掉测试进程要多活一分钟
  globalThis.setTimeout = ((fn: any, ms?: number, ...rest: any[]) =>
    (ms ?? 0) >= 1000
      ? (0 as any)
      : realSetTimeout(fn, ms, ...rest)) as unknown as typeof setTimeout;

  (globalThis as any).document = {
    createElement: () => {
      const link: any = {
        download: '',
        click() {
          downloads.push({ filename: link.download, blob: lastBlob! });
        },
      };
      return link;
    },
    body: { appendChild() {}, removeChild() {} },
  };

  (globalThis as any).URL.createObjectURL = (blob: Blob) => {
    lastBlob = blob;
    return 'blob:excel-test';
  };
  (globalThis as any).URL.revokeObjectURL = () => {};
}

async function exportAndCapture(
  scheme: ExportExcelScheme,
  data: any,
  options?: ExportExcelOptions,
) {
  downloads = [];
  await exportExcel(scheme, data, options);
  assert.equal(downloads.length, 1, '一次导出应当只触发一次下载');
  return downloads[0];
}

async function unzip(blob: Blob) {
  return JSZip.loadAsync(new Uint8Array(await blob.arrayBuffer()));
}

async function readEntry(zip: JSZip, path: string) {
  const entry = zip.file(path);
  assert.ok(entry, `xlsx 内缺少 ${path}`);
  return entry.async('string');
}

/* ------------------------------------------------------- xlsx 内容小工具 */

interface ParsedCell {
  ref: string;
  isShared: boolean;
  style: string | null;
  raw: string | null;
}

function parseCells(sheetXml: string) {
  const cells = new Map<string, ParsedCell>();

  const push = (ref: string, attrs: string, inner?: string) => {
    cells.set(ref, {
      ref,
      isShared: /t="s"/.test(attrs),
      style: attrs.match(/\bs="(\d+)"/)?.[1] ?? null,
      raw: inner?.match(/<v>([\s\S]*?)<\/v>/)?.[1] ?? null,
    });
  };

  // 自闭合（空值 / 合并占位）与带 <v> 的两种写法分开匹配，避免互相吞掉
  for (const m of sheetXml.matchAll(/<c r="([^"]*)"([^>]*?)\/>/g)) push(m[1], m[2]);
  for (const m of sheetXml.matchAll(/<c r="([^"]*)"([^>]*)>([\s\S]*?)<\/c>/g))
    push(m[1], m[2], m[3]);

  return cells;
}

function unescapeXml(value: string) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function parseSharedStrings(xml: string) {
  return [...xml.matchAll(/<si><t(?: [^>]*)?>([\s\S]*?)<\/t><\/si>/g)].map((m) =>
    unescapeXml(m[1]),
  );
}

function cellText(cell: ParsedCell | undefined, shared: string[]) {
  if (!cell) return undefined;
  if (cell.raw === null) return '';
  return cell.isShared ? shared[Number(cell.raw)] : cell.raw;
}

function parseMerges(sheetXml: string) {
  return [...sheetXml.matchAll(/<mergeCell ref="([^"]+)" \/>/g)].map((m) => m[1]).sort();
}

/* ------------------------------------------------------------ 公用测试数据 */

const flatSheet: ExportExcelWorkSheet = {
  name: '明细',
  columns: [
    { prop: 'code', label: '编号' },
    { prop: 'name', label: '姓名' },
    { prop: 'idcard', label: '证件号' },
    { prop: 'amount', label: '金额' },
  ],
};

// 编号带前导零、证件号 18 位、金额是真正的数字 —— 正好覆盖「数字格 vs 文本格」的分叉
const flatData = [{ code: '0012', name: '张三', idcard: '110101199003071234', amount: 61.9 }];

const groupedSheet: ExportExcelWorkSheet = {
  name: '分组',
  columns: [
    { prop: 'a', label: 'A' },
    {
      label: 'G',
      columns: [
        { prop: 'b', label: 'B' },
        {
          label: 'H',
          columns: [
            { prop: 'c', label: 'C1' },
            { prop: 'd', label: 'C2' },
          ],
        },
      ],
    },
    { prop: 'e', label: 'E' },
  ],
};

/* ----------------------------------------------------------------- 测试 */

const tests: { name: string; fn: () => Promise<void> | void }[] = [];
const test = (name: string, fn: () => Promise<void> | void) => tests.push({ name, fn });

test('encodeCol / encodeCell：下标与 A1 引用互相对应', () => {
  assert.equal(encodeCol(0), 'A');
  assert.equal(encodeCol(25), 'Z');
  assert.equal(encodeCol(26), 'AA');
  assert.equal(encodeCol(51), 'AZ');
  assert.equal(encodeCol(52), 'BA');
  assert.equal(encodeCol(701), 'ZZ');
  assert.equal(encodeCol(702), 'AAA');

  assert.equal(encodeCell({ c: 18, r: 1 }), 'S2');
  assert.equal(encodeRange({ s: { c: 0, r: 0 }, e: { c: 0, r: 2 } }), 'A1:A3');
});

test('encodeCol：与 decodeCol 对每一列都互为逆运算', () => {
  // 曾经的实现是普通的 26 进制取模，所有以 Z 结尾的列（Z、AZ…）都会编成 A@/B@
  for (let i = 0; i < 900; i++) {
    assert.equal(decodeCol(encodeCol(i)), i, `第 ${i} 列往返失败`);
  }
});

test('encodeCol：非法下标抛错，而不是静默返回空串', () => {
  // 退化成空串的话，数据格会写出非法的 r="0"，WPS 之外没人认
  for (const bad of [-1, -Infinity, Infinity, NaN, 1.5]) {
    assert.throws(() => encodeCol(bad), RangeError, `encodeCol(${bad}) 应当抛错`);
  }
});

test('xlsx：每个单元格引用都合法，且逐行连续', async () => {
  const { blob } = await exportAndCapture(
    { filename: 'ref', bookType: 'xlsx', worksheet: flatSheet },
    flatData,
  );
  const sheetXml = await readEntry(await unzip(blob), 'xl/worksheets/sheet1.xml');

  assert.ok(!/r="0"/.test(sheetXml), '出现了非法的 r="0"');

  const cells = parseCells(sheetXml);
  assert.deepEqual(
    [...cells.keys()].sort(),
    ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2'],
    '单元格引用集合不对',
  );

  for (const ref of cells.keys()) {
    assert.match(ref, /^[A-Z]{1,3}\d+$/, `${ref} 不是合法的单元格引用`);
  }
});

test('xlsx：宽表跨过 Z 列后引用依然合法', async () => {
  const width = 30; // 用户那份表 19 列，离 Z 列只差 6 列
  const columns = Array.from({ length: width }, (_, i) => ({
    prop: `c${i}`,
    label: `列${i + 1}`,
  }));
  const row = Object.fromEntries(columns.map((column, i) => [column.prop, i + 1]));

  const { blob } = await exportAndCapture(
    { filename: 'wide', bookType: 'xlsx', worksheet: { name: '宽表', columns } },
    [row],
  );
  const cells = parseCells(await readEntry(await unzip(blob), 'xl/worksheets/sheet1.xml'));

  for (const ref of cells.keys()) {
    assert.match(ref, /^[A-Z]{1,3}\d+$/, `${ref} 不是合法的单元格引用`);
  }

  assert.ok(cells.has('Z1'), '第 26 列应当是 Z1');
  assert.ok(cells.has('AA1'), '第 27 列应当是 AA1');
  assert.ok(cells.has('AD1'), '第 30 列应当是 AD1');
  assert.equal(cells.size, width * 2, '表头与数据行各 30 个单元格');
});

test('xlsx：前导零 / 18 位证件号写成文本，数字仍是数字', async () => {
  const { blob } = await exportAndCapture(
    { filename: 'text', bookType: 'xlsx', worksheet: flatSheet },
    flatData,
  );
  const zip = await unzip(blob);
  const sheetXml = await readEntry(zip, 'xl/worksheets/sheet1.xml');
  const shared = parseSharedStrings(await readEntry(zip, 'xl/sharedStrings.xml'));
  const cells = parseCells(sheetXml);

  assert.equal(cellText(cells.get('A2'), shared), '0012', '编号应当原样保留前导零');
  assert.equal(cellText(cells.get('C2'), shared), '110101199003071234', '长数字不应被改写');
  assert.equal(cells.get('A2')?.isShared, true, '前导零编号应当走共享字符串');
  assert.equal(cells.get('C2')?.isShared, true, '长数字应当走共享字符串');

  assert.equal(cells.get('D2')?.isShared, false, '真正的数字不应写成文本');
  assert.equal(cells.get('D2')?.raw, '61.9');

  assert.ok(shared.includes('0012'), '共享字符串里应当能查到 0012');
});

test('xlsx：表头合并区与行列跨度和 columns 一致', async () => {
  const { blob } = await exportAndCapture(
    { filename: 'merge', bookType: 'xlsx', worksheet: groupedSheet },
    [{ a: 1, b: 2, c: 3, d: 4, e: 5 }],
  );
  const sheetXml = await readEntry(await unzip(blob), 'xl/worksheets/sheet1.xml');

  assert.deepEqual(parseMerges(sheetXml), [
    'A1:A3', // A 纵跨三层
    'B1:D1', // G 横跨 B/H 及其两个子列
    'B2:B3', // B 纵跨两层
    'C2:D2', // H 横跨 C1/C2
    'E1:E3', // E 纵跨三层
  ]);

  const cells = parseCells(sheetXml);
  assert.equal(cells.get('A1')?.style, '1', '表头应当挂上居中样式');
  assert.equal(cells.get('A2')?.style, '1', '合并占位格也属表头');
  assert.equal(cells.get('A4')?.style, null, '数据行不应带表头样式');
});

test('xlsx：noHead + 空数据不卡死，dimension 合法', async () => {
  const { blob } = await exportAndCapture(
    { filename: 'empty', bookType: 'xlsx', worksheet: { ...flatSheet, noHead: true } },
    [],
  );
  const sheetXml = await readEntry(await unzip(blob), 'xl/worksheets/sheet1.xml');

  assert.match(sheetXml, /<dimension ref="A1:A1" \/>/);
  assert.match(sheetXml, /<sheetData><\/sheetData>/);
});

test('encodeCol：-Infinity 这类越界值不会再变成死循环', () => {
  // 空表曾经算出 dimension 的 e.c = -Infinity，配上一个宽容的 encodeCol 就是 while(true)
  assert.throws(() => encodeRange({ s: { c: 0, r: 0 }, e: { c: -Infinity, r: 0 } }), RangeError);
});

test('xlsx：多 sheet 的标签名与内容不错位', async () => {
  const sheets: ExportExcelWorkSheet[] = ['第一', '第二', '第三'].map((name) => ({
    name,
    columns: [{ prop: 'v', label: '值' }],
  }));
  const data = {
    第一: [{ v: 'A1内容' }],
    第二: [{ v: 'B1内容' }],
    第三: [{ v: 'C1内容' }],
  };

  const { blob } = await exportAndCapture(
    { filename: 'multi', bookType: 'xlsx', worksheets: sheets },
    data,
  );
  const zip = await unzip(blob);
  const shared = parseSharedStrings(await readEntry(zip, 'xl/sharedStrings.xml'));

  const body = async (idx: number) => {
    const xml = await readEntry(zip, `xl/worksheets/sheet${idx}.xml`);
    return cellText(parseCells(xml).get('A2'), shared);
  };

  assert.equal(await body(1), 'A1内容');
  assert.equal(await body(2), 'B1内容');
  assert.equal(await body(3), 'C1内容');

  const workbook = await readEntry(zip, 'xl/workbook.xml');
  assert.deepEqual(
    [...workbook.matchAll(/<sheet name="([^"]*)"/g)].map((m) => m[1]),
    ['第一', '第二', '第三'],
  );

  const rels = await readEntry(zip, 'xl/_rels/workbook.xml.rels');
  assert.match(rels, /Id="rId1"[^>]*Target="worksheets\/sheet1\.xml"/);
});

test('xlsx：sheet 名与单元格内容都会转义', async () => {
  const { blob } = await exportAndCapture(
    {
      filename: 'escape',
      bookType: 'xlsx',
      worksheet: { name: 's&1', columns: [{ prop: 'v', label: '值' }] },
    },
    [{ v: '<a>&"b' }],
  );
  const zip = await unzip(blob);

  assert.match(await readEntry(zip, 'xl/workbook.xml'), /<sheet name="s&amp;1"/);
  assert.match(
    await readEntry(zip, 'xl/sharedStrings.xml'),
    /<t xml:space="preserve">&lt;a&gt;&amp;&quot;b<\/t>/,
  );
});

test('csv / txt：带 BOM 与 charset，序列化函数本身保持纯净', async () => {
  const sheet: ExportExcelWorkSheet = {
    name: '明细',
    columns: [
      { prop: 'name', label: '姓名' },
      { prop: 'amount', label: '金额' },
    ],
  };

  for (const bookType of ['csv', 'txt'] as const) {
    const { filename, blob } = await exportAndCapture(
      { filename: 'bom', bookType, worksheet: sheet },
      [{ name: '张三', amount: 61.9 }],
    );
    const bytes = new Uint8Array(await blob.arrayBuffer());

    assert.equal(filename, `bom.${bookType}`);
    // 注意 Blob.text() 会按 UTF-8 解码并吞掉 BOM，只能直接看字节
    assert.deepEqual([...bytes.slice(0, 3)], [0xef, 0xbb, 0xbf], `${bookType} 应当带 BOM`);
    assert.ok(blob.type.includes('charset=utf-8'), `${bookType} 的 mime 应当带 charset`);
    assert.ok((await blob.text()).includes('张三'));
  }

  const xlsx = await exportAndCapture({ filename: 'mime', bookType: 'xlsx', worksheet: sheet }, [
    { name: '张三', amount: 61.9 },
  ]);
  assert.equal(
    xlsx.blob.type,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'xlsx 的 mime 不该被追加 charset',
  );

  // BOM 是「写文件」这层的事，wb2csv 直接调用时不应被污染
  const wb = new WorkBook('pure.csv');
  const ws = new WorkSheet('明细');
  ws.setCell(0, 0, new Cell('姓名'));
  wb.addSheet(ws);
  assert.equal(wb2csv(wb), '姓名');
});

test('xml / html：用户数据被转义，不会注入', async () => {
  const sheet: ExportExcelWorkSheet = {
    name: 's&1',
    columns: [{ prop: 'v', label: '值' }],
  };
  const payload = '<img src=x onerror=alert(1)>';

  const xml = await exportAndCapture({ filename: 'x', bookType: 'xml', worksheet: sheet }, [
    { v: payload },
  ]);
  const xmlText = await xml.blob.text();
  assert.ok(xmlText.includes('ss:Name="s&amp;1"'), 'sheet 名应当转义');
  assert.ok(!xmlText.includes('<img'), 'xml 里不应出现未转义的内容');
  assert.ok(xmlText.includes('&lt;img'), 'xml 里应当出现转义后的内容');

  const html = await exportAndCapture({ filename: 'h', bookType: 'html', worksheet: sheet }, [
    { v: payload },
  ]);
  const htmlText = await html.blob.text();
  assert.ok(!/<img\s/i.test(htmlText), 'html 里不应出现未转义的标签');
  assert.ok(htmlText.includes('&lt;img src=x onerror=alert(1)&gt;'), 'html 里应当保留转义文本');
});

test('pruneColumns：丢掉非对象项，并递归丢掉子列被剔光的组', () => {
  const pruned = pruneColumns([
    { prop: 'a', label: 'A' },
    { label: 'G', columns: [] },
    {
      label: 'H',
      columns: [
        { prop: 'b', label: 'B' },
        { label: 'I', columns: [] },
      ],
    },
    false,
    null,
    undefined,
  ]);

  assert.deepEqual(
    pruned.map((column) => column.label),
    ['A', 'H'],
    '空组与非法项都应被丢掉',
  );
  assert.deepEqual(
    pruned[1].columns?.map((column) => column.label),
    ['B'],
  );
});

test('xlsx：分组子列被全部取消勾选时，表头与数据不错位', async () => {
  // table-export 的 transformColumns 会产出 { label: 'G', columns: [] }
  const columns = [
    { prop: 'a', label: 'A' },
    { label: 'G', columns: [] },
    { prop: 'b', label: 'B' },
  ] as unknown as TableColumnProps[];

  const { blob } = await exportAndCapture(
    { filename: 'blank-group', bookType: 'xlsx', worksheet: { name: 's', columns } },
    [{ a: 'a1', b: 'b1' }],
  );
  const cells = parseCells(await readEntry(await unzip(blob), 'xl/worksheets/sheet1.xml'));

  // 历史表现：表头 3 格（多出被剔光的空组）、数据 2 格，整行错位
  assert.deepEqual([...cells.keys()].sort(), ['A1', 'A2', 'B1', 'B2']);
});

test('xlsx：columns 混入非对象项时，表头与数据列数一致', async () => {
  const columns = [
    { prop: 'a', label: 'A' },
    false,
    { prop: 'b', label: 'B' },
    null,
  ] as unknown as TableColumnProps[];

  const { blob } = await exportAndCapture(
    { filename: 'mixed-columns', bookType: 'xlsx', worksheet: { name: 's', columns } },
    [{ a: 'a1', b: 'b1' }],
  );
  const cells = parseCells(await readEntry(await unzip(blob), 'xl/worksheets/sheet1.xml'));

  assert.deepEqual([...cells.keys()].sort(), ['A1', 'A2', 'B1', 'B2']);
});

test('exportExcel：缺 worksheet / 数据里没有对应 sheet / 格式非法都明确报错', async () => {
  await assert.rejects(
    () => exportAndCapture({ filename: 'none', bookType: 'xlsx' }, []),
    /需要提供 worksheet/,
  );

  await assert.rejects(
    () =>
      exportAndCapture(
        {
          filename: 'missing',
          bookType: 'csv',
          worksheets: [{ name: '缺失', columns: [{ prop: 'v', label: '值' }] }],
        },
        { 其它: [] },
      ),
    /找不到工作表/,
  );

  await assert.rejects(
    () =>
      exportAndCapture(
        { filename: 'bad', bookType: 'pdf' as ExportBookType, worksheet: flatSheet },
        flatData,
      ),
    /不支持的导出格式/,
  );
});

test('exportExcel：filename 已带扩展名时不重复拼接', async () => {
  const { filename } = await exportAndCapture(
    { filename: '报表.xlsx', bookType: 'xlsx', worksheet: flatSheet },
    flatData,
  );
  assert.equal(filename, '报表.xlsx');

  const csv = await exportAndCapture(
    { filename: '报表', bookType: 'csv', worksheet: flatSheet },
    flatData,
  );
  assert.equal(csv.filename, '报表.csv');
});

test('csv / txt：公式开头的值被写成文本，正常数字不受影响', async () => {
  const sheet: ExportExcelWorkSheet = {
    name: 's',
    columns: [
      { prop: 'f1', label: 'F1' },
      { prop: 'f2', label: 'F2' },
      { prop: 'num', label: '数字' },
      { prop: 'plus', label: '正数' },
      { prop: 'text', label: '文本' },
    ],
  };
  const row = {
    f1: '=HYPERLINK("http://evil","click")',
    f2: '@SUM(A1:A9)',
    num: -42.5,
    plus: '+7',
    text: '普通文本',
  };

  const { blob } = await exportAndCapture(
    { filename: 'inject', bookType: 'csv', worksheet: sheet },
    [row],
  );
  const [, dataLine] = (await blob.text()).split('\r\n');

  assert.ok(dataLine.startsWith(`"'=HYPERLINK`), '= 开头的值应当被前置单引号');
  assert.ok(dataLine.includes(`'@SUM(A1:A9)`), '@ 开头的值应当被前置单引号');
  assert.ok(dataLine.includes(',-42.5,'), '普通负数应当保持数字形态');
  assert.ok(dataLine.includes(',+7,'), '纯数字形态的 +7 不该被改写');

  const txt = await exportAndCapture({ filename: 'inject', bookType: 'txt', worksheet: sheet }, [
    row,
  ]);
  assert.ok((await txt.blob.text()).includes(`'=HYPERLINK`), 'txt 同样要防护');
});

test('aoa2csv：含孤立 \\r 的字段会被引号包住，分隔符是特殊字符也不炸', () => {
  // 之前用 new RegExp(`[${FS}"\n]`) 拼字符类，FS 传 ] 会直接抛 SyntaxError
  assert.equal(aoa2csv([['a\rb']]), '"a\rb"');
  assert.equal(aoa2csv([['a]b']], ']'), '"a]b"');
  assert.equal(aoa2csv([['x', 'y']], ']'), 'x]y');
});

/* ----------------------------------------------------------------- runner */

async function run() {
  installBrowserStubs();

  let failed = 0;

  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`\x1b[32m✓\x1b[0m ${name}`);
    } catch (error) {
      failed++;
      console.error(`\x1b[31m✗\x1b[0m ${name}\n    ${(error as Error).message}`);
    }
  }

  console.log(`\n${tests.length - failed}/${tests.length} 通过`);
  process.exitCode = failed ? 1 : 0;
}

run();
