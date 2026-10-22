/**
 * dict 回归测试
 *
 * 跑法：`pnpm test:dict`
 *
 * 钉住：
 * 1. 数组 / 对象两种写法的归一化（对象形式的 value 是字符串）
 * 2. 数字与字符串值的宽松匹配（`getLabel('1')` 能命中 `value: 1`）
 * 3. 异步字典的 loading → 完成
 * 4. 「先 useDict、后 registerDicts」也能加载（注册表版本号触发）
 * 5. 找不到时回退到原值
 * 6. `labelKey` 优先于 `label`，并按当前语言翻译
 * 7. 未初始化 i18n 时 `translateMessage` 安全返回 undefined
 */
import assert from 'node:assert/strict';

import { nextTick } from 'vue';

import { translateMessage } from '../locale';
import { clearDicts, registerDicts, useDict } from './index';

const flush = async () => {
  await nextTick();
  await Promise.resolve();
  await nextTick();
};

// 1. 数组形式
clearDicts();
registerDicts({
  user_status: [
    { value: 1, label: '启用', color: 'success' },
    { value: 0, label: '禁用', color: 'info' },
  ],
});

const status = useDict('user_status');

assert.equal(status.items.value.length, 2);
assert.deepEqual(
  status.items.value.map((item) => item.label),
  ['启用', '禁用'],
);
assert.equal(status.getLabel(1), '启用');
assert.equal(status.getLabel('1'), '启用');
assert.equal(status.getColor(0), 'info');
assert.equal(status.getColor(9), undefined);
assert.deepEqual(status.getItem(1), { value: 1, label: '启用', color: 'success' });

// 找不到时回退
assert.equal(status.getLabel(9), '9');
assert.equal(status.getLabel(9, '未知'), '未知');
assert.equal(status.getLabel(null), '');

// 2. 对象形式：value 取字符串
registerDicts({
  yes_no: { 1: '是', 0: '否' },
});

const yesNo = useDict('yes_no');

assert.deepEqual(yesNo.items.value.map((item) => [item.value, item.label]).sort(), [
  ['0', '否'],
  ['1', '是'],
]);

// 3. 异步字典
let resolveAsync: (value: any) => void = () => void 0;

registerDicts({
  dept: () =>
    new Promise((resolve) => {
      resolveAsync = resolve;
    }),
});

const dept = useDict('dept');

assert.equal(dept.loading.value, true);
assert.equal(dept.items.value.length, 0);

resolveAsync([{ value: 'd1', label: '研发部' }]);
await flush();

assert.equal(dept.loading.value, false);
assert.equal(dept.getLabel('d1'), '研发部');

// 4. 先使用、后注册
const late = useDict('late_dict');

assert.equal(late.items.value.length, 0);

registerDicts({ late_dict: [{ value: 1, label: '迟到' }] });
await flush();

assert.equal(late.getLabel(1), '迟到');

// 5. 默认空字典不报错
const missing = useDict('not_exists');

assert.equal(missing.items.value.length, 0);
assert.equal(missing.getLabel('x'), 'x');

// 6. labelKey 优先于 label；无 labelKey 时用 label
registerDicts({
  i18n_status: [
    { value: 1, label: '固定文案', labelKey: 'co.common.yes' },
    { value: 0, label: '固定文案' },
  ],
});

const i18nStatus = useDict('i18n_status');

// 非组件环境下走默认语言（zh-cn）
assert.equal(i18nStatus.getLabel(1), '是');
assert.equal(i18nStatus.getText(1), '是');
assert.equal(i18nStatus.getLabel(0), '固定文案');

// 7. 未 launch 时 `translateMessage`（应用词条）必须安全返回 undefined，
//    不能因为拿不到 i18n 实例就抛错；此时 labelKey 退回框架词条 / key 本身
assert.equal(translateMessage('co.common.yes'), undefined);

registerDicts({
  unknown_key: [{ value: 1, labelKey: 'not.exists.key' }],
});

assert.equal(useDict('unknown_key').getLabel(1), 'not.exists.key');

clearDicts();

console.log('dict: ok');
