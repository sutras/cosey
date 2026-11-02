/**
 * table-column renderer 的取值/选项逻辑回归测试
 *
 * 跑法：`pnpm test:renderer`
 *
 * 钉住（这次扩展新加的契约）：
 * 1. `empty`：只有 null / undefined / '' / [] 算空，`0` 与 `false` 不算
 * 2. `fallback`：cellValue 空时才走备用字段，第一个非空命中即停
 * 3. `tag.options`：值命中用 label / color，没命中回落原值；`'1'` 能命中 `1`
 * 4. `boolean`：`'0'` 必须判成假（`Boolean('0')` 是 true，这里不能直接用它）
 * 5. `exportRenderer` 与 `renderer` 共用取值规则 —— 导出的值不能和屏幕上不一致
 * 6. `format` 仍优先于 `renderer`（既有契约，防止扩展后改坏）
 *
 * 只测纯逻辑与 `exportRenderer`（返回字符串）。`renderer` 的 JSX 分支在 node 里
 * 没有 JSX 运行时，靠组件测试/页面验收，不在这里假装测过。
 */
import assert from 'node:assert/strict';

import { exportRenderer } from './renderer.tsx';
import { isTruthy, resolveCellValue, resolveOption } from './renderer.resolve.ts';

// 1. 取值：非空直接用 cellValue
assert.equal(resolveCellValue({ a: 'x' }, 'y', {}), 'y');

// 空时走 fallback：主字段（昵称）没值，退回用户名
assert.equal(
  resolveCellValue({ actor: { username: 'root' } }, '', {
    fallback: ['actor.nickname', 'actor.username'],
  }),
  'root',
);
assert.equal(
  resolveCellValue({ actor: { username: 'root' } }, null, { fallback: ['actor.username'] }),
  'root',
);

// 第一个非空命中即停
assert.equal(resolveCellValue({ a: 'A', b: 'B' }, undefined, { fallback: ['a', 'b'] }), 'A');

// 全空 → undefined（交给 empty 占位）
assert.equal(resolveCellValue({}, undefined, { fallback: ['a', 'b'] }), undefined);

// 0 / false 不算空：不能被 empty 吃掉
assert.equal(resolveCellValue({}, 0, {}), 0);
assert.equal(resolveCellValue({}, false, {}), false);

// 2. 选项命中：'1' 与 1 视为同一个
const statusOptions = [
  { label: '待处理', value: 0, tag: 'warning' as const },
  { label: '已结束', value: 2, tag: 'info' as const },
];
assert.equal(resolveOption(statusOptions, 2)?.label, '已结束');
assert.equal(resolveOption(statusOptions, '2')?.label, '已结束');
assert.equal(resolveOption(statusOptions, 9), undefined);
assert.equal(resolveOption(undefined, 9), undefined);

// 3. 真值判定
assert.equal(isTruthy(1), true);
assert.equal(isTruthy('1'), true);
assert.equal(isTruthy(true), true);
assert.equal(isTruthy(0), false);
assert.equal(isTruthy('0'), false);
assert.equal(isTruthy(false), false);
assert.equal(isTruthy(''), false);

// 4. exportRenderer
const column = (extra: Record<string, any>) => ({ label: 'x', ...extra }) as any;

// tag + options → 文案
assert.equal(
  exportRenderer({}, column({ renderer: { type: 'tag', options: statusOptions } }), 2, 0),
  '已结束',
);

// tag + options 未命中 → 回落原值
assert.equal(
  exportRenderer({}, column({ renderer: { type: 'tag', options: statusOptions } }), 9, 0),
  '9',
);

// tag + path：每一项是对象时取字段
assert.equal(
  exportRenderer(
    {},
    column({ renderer: { type: 'tag', path: 'name' } }),
    [{ name: '角色A' }, { name: '角色B' }],
    0,
  ),
  '角色A, 角色B',
);

// boolean
assert.equal(
  exportRenderer(
    {},
    column({ renderer: { type: 'boolean', trueText: '内置', falseText: '普通' } }),
    1,
    0,
  ),
  '内置',
);
assert.equal(
  exportRenderer(
    {},
    column({ renderer: { type: 'boolean', trueText: '内置', falseText: '普通' } }),
    0,
    0,
  ),
  '普通',
);

// empty 占位。注意只认对象形：`renderer: 'text'` 是「全默认」，带不了选项
assert.equal(
  exportRenderer({}, column({ renderer: { type: 'datetime', empty: '—' } }), null, 0),
  '—',
);
assert.equal(
  exportRenderer({}, column({ renderer: { type: 'text', empty: '-' } }), undefined, 0),
  '-',
);

// 对象写法省掉 type 时按 text 处理（不然 switch 没有分支命中、单元格空白）
assert.equal(exportRenderer({}, column({ renderer: { empty: '-' } }), undefined, 0), '-');
assert.equal(exportRenderer({}, column({ renderer: { empty: '-' } }), '有值', 0), '有值');
assert.equal(
  exportRenderer({ mobile: '139****8866' }, column({ renderer: { fallback: ['mobile'] } }), '', 0),
  '139****8866',
);

// fallback 取到值后仍按 renderer 处理
assert.equal(
  exportRenderer(
    { handledAt: '2026-11-02 08:30:00' },
    column({ renderer: { type: 'datetime', fallback: ['handledAt'] } }),
    null,
    0,
  ),
  '2026-11-02 08:30:00',
);

// boolean 的默认文案走 i18n：传了 t 就跟界面语言，没传才兜底中文
const fakeT = (key: string) => ({ 'co.common.yes': 'YES', 'co.common.no': 'NO' })[key] ?? key;
assert.equal(exportRenderer({}, column({ renderer: 'boolean' }), 1, 0, fakeT), 'YES');
assert.equal(exportRenderer({}, column({ renderer: 'boolean' }), 0, 0, fakeT), 'NO');
assert.equal(exportRenderer({}, column({ renderer: 'boolean' }), '1', 0), '是');
assert.equal(exportRenderer({}, column({ renderer: 'boolean' }), '0', 0), '否');

// 显式文案优先于 locale
assert.equal(
  exportRenderer({}, column({ renderer: { type: 'boolean', trueText: '开' } }), 1, 0, fakeT),
  '开',
);

// 金额：美元带 $、人民币带 ¥、美分先除以 100
assert.equal(exportRenderer({}, column({ renderer: 'usd' }), 1280, 0), '$1,280.00');
assert.equal(exportRenderer({}, column({ renderer: 'usd' }), 0.5, 0), '$0.50');
assert.equal(exportRenderer({}, column({ renderer: 'cny' }), 1280, 0), '¥1,280.00');
assert.equal(exportRenderer({}, column({ renderer: 'cent' }), 128000, 0), '$1,280.00');
assert.equal(exportRenderer({}, column({ renderer: 'cent' }), 1, 0), '$0.01');
assert.equal(exportRenderer({}, column({ renderer: 'cny' }), -99, 0), '-¥99.00');

// 金额的可选项：小数位、符号语言
assert.equal(
  exportRenderer({}, column({ renderer: { type: 'cny', props: { precision: 0 } } }), 1280, 0),
  '¥1,280',
);
assert.equal(
  exportRenderer({}, column({ renderer: { type: 'usd', props: { locale: 'zh-CN' } } }), 1280, 0),
  'US$1,280.00',
);

// 金额 + fallback：主字段空时用备用金额
assert.equal(
  exportRenderer(
    { discount: 88.5 },
    column({ renderer: { type: 'cny', fallback: ['discount'] } }),
    '',
    0,
  ),
  '¥88.50',
);

// 非数字原样吐出，不渲染 NaN
assert.equal(exportRenderer({}, column({ renderer: 'usd' }), '待定', 0), '待定');

// format 仍优先于 renderer（扩展 renderer 不能撬动这条）
assert.equal(
  exportRenderer(
    {},
    column({ renderer: 'datetime', format: () => '自定义' }),
    '2026-11-02 08:30:00',
    0,
  ),
  '自定义',
);

console.log('renderer: ok');
