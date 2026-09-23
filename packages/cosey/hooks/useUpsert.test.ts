/**
 * hooks/useUpsert 回归测试
 *
 * 跑法：`pnpm test:upsert`（即 `tsx ./packages/cosey/hooks/useUpsert.test.ts`）
 *
 * 不追求覆盖率，只钉住「新增/编辑弹框状态机」里出错了也不会报错的那几类行为：
 * 1. 连续点两行的「编辑」，先发起、后返回的详情不能覆盖后打开的表单
 * 2. 外层 useOuterUpsert.edit 返回 Promise，await 之后表单已回填
 * 3. 详情未回填完就点确定，提交的必须是回填后的数据
 * 4. 编辑途中切「新增」，在途详情不能写进新增表单
 * 5. 详情接口失败：不产生 unhandled rejection，并关闭弹框（留着空表单会被误提交）
 * 6. 被新一次打开作废的 onShown / onShownEdit 不再触发
 * 7. loading 在回填期间为 true，结束后回到 false
 */
import assert from 'node:assert/strict';
import process from 'node:process';

import { ElMessage } from 'element-plus';
import { createApp, nextTick, reactive } from 'vue';

import { useOuterUpsert, useUpsert } from './useUpsert';

/* ------------------------------------------------------------------ 测试桩 */

// 没有组件实例，useLocale 的 inject / useTemplateRef 会拿到空上下文，
// 用 createApp().runWithContext 补上（只是取默认中文词条，不需要挂载 DOM）。
const app = createApp({});

const open = (options: any) => app.runWithContext(() => useUpsert(options));
const openOuter = () => app.runWithContext(() => useOuterUpsert());

// ElMessage 需要真实 DOM，替换成收集器
const messages: string[] = [];
(ElMessage as any).success = (message: string) => messages.push(message);

// 详情失败时 hook 会 console.error，收起来避免测试输出里出现预期内的堆栈
const logged: any[][] = [];
console.error = (...args: any[]) => logged.push(args);

const unhandled: any[] = [];
process.on('unhandledRejection', (reason) => unhandled.push(reason));

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/* ------------------------------------------------------------------ 用例 */

// 连续点两行「编辑」：后打开的（B）必须赢，即使它的详情先返回
async function raceBetweenEdits() {
  const model = reactive<any>({ title: undefined, digest: undefined });

  const { edit } = open({
    model,
    detailsFetch: (row: any) =>
      row.id === 1
        ? sleep(120).then(() => ({ id: 1, title: 'A', digest: 'a-digest' }))
        : sleep(20).then(() => ({ id: 2, title: 'B' })),
  });

  const first = edit({ id: 1 });
  await sleep(5);
  const second = edit({ id: 2 });
  await Promise.all([first, second]);

  assert.deepStrictEqual({ ...model }, { title: 'B', digest: undefined });
}

// 外层 await edit() 之后，表单应当已经回填
async function outerEditIsAwaitable() {
  const model = reactive<any>({ title: undefined });

  const inner = open({
    model,
    detailsFetch: () => sleep(30).then(() => ({ id: 1, title: 'A' })),
  });

  const outer = openOuter();
  outer.ref(inner.expose);

  await outer.edit({ id: 1 });

  assert.equal(model.title, 'A');
}

// 详情还没回来就点确定，不能把重置后的空表单提交上去
async function submitWaitsForFill() {
  const model = reactive<any>({ title: undefined });
  const submitted: any[] = [];

  const { edit, formProps } = open({
    model,
    detailsFetch: () => sleep(60).then(() => ({ id: 1, title: 'A' })),
    editFetch: async (row: any) => {
      submitted.push({ ...model });
      return row;
    },
  });

  edit({ id: 1 });
  await sleep(10);
  await formProps.submit();

  assert.equal(submitted[0]?.title, 'A');
}

// 编辑途中切「新增」，在途的详情不能写进新增表单
async function addCancelsPendingFill() {
  const model = reactive<any>({ title: undefined });

  const { edit, add, type } = open({
    model,
    detailsFetch: () => sleep(120).then(() => ({ id: 1, title: 'A' })),
  });

  edit({ id: 1 });
  await sleep(10);
  add();
  await sleep(200);

  assert.equal(model.title, undefined);
  assert.equal(type.value, 'add');
}

// 详情失败：不产生 unhandled rejection，并关闭弹框
async function fetchErrorClosesDialog() {
  const model = reactive<any>({ title: undefined });

  const { edit, dialogProps } = open({
    model,
    detailsFetch: () => sleep(10).then(() => Promise.reject(new Error('boom'))),
  });

  unhandled.length = 0;
  logged.length = 0;
  edit({ id: 1 });
  await sleep(80);

  assert.equal(unhandled.length, 0);
  assert.equal(dialogProps.modelValue, false);
  assert.equal(logged.length, 1);
}

// 被新一次打开作废的 onShownEdit 不该再触发
async function staleShownCallbackSkipped() {
  const model = reactive<any>({ title: undefined });
  const shown: number[] = [];

  const { edit } = open({
    model,
    onShownEdit: (row: any) => shown.push(row.id),
  });

  edit({ id: 1 });
  edit({ id: 2 });
  await nextTick();
  await sleep(20);

  assert.deepStrictEqual(shown, [2]);
}

// loading 覆盖整个回填过程
async function loadingDuringFill() {
  const model = reactive<any>({ title: undefined });

  const { edit, loading } = open({
    model,
    detailsFetch: () => sleep(60).then(() => ({ id: 1, title: 'A' })),
  });

  const pending = edit({ id: 1 });
  await sleep(10);

  assert.equal(loading.value, true);

  await pending;

  assert.equal(loading.value, false);
}

/* ------------------------------------------------------------------ 执行 */

const cases: [string, () => Promise<void>][] = [
  ['连续编辑不会互相覆盖', raceBetweenEdits],
  ['外层 edit 可以 await', outerEditIsAwaitable],
  ['提交前会等详情回填', submitWaitsForFill],
  ['新增会作废在途的详情回填', addCancelsPendingFill],
  ['详情失败会关闭弹框且不产生未处理拒绝', fetchErrorClosesDialog],
  ['作废的 onShownEdit 不再触发', staleShownCallbackSkipped],
  ['loading 覆盖回填过程', loadingDuringFill],
];

let failed = 0;

for (const [name, run] of cases) {
  try {
    await run();
    console.log(`PASS  ${name}`);
  } catch (err) {
    failed += 1;
    console.log(`FAIL  ${name}`);
    console.log(`      ${(err as Error).message.split('\n').join('\n      ')}`);
  }
}

console.log(`\nuseUpsert：${cases.length - failed} / ${cases.length} 通过`);
console.log(`ElMessage.success 触发 ${messages.length} 次`);

if (failed > 0) {
  throw new Error(`${failed} 个用例未通过`);
}
