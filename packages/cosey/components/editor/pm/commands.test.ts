/**
 * components/editor/pm/commands 回归测试
 *
 * 跑法：`pnpm test:commands`
 *
 * 目前只钉「分割线」的插入落点 —— 它是唯一一个「插进去就不属于任何段落」的块级原子节点，
 * 落点算错不会报错，只会让文档悄悄变脏：点一次按钮多一个空段落，或者光标被送进后面的表格里。
 */
import assert from 'node:assert/strict';

import { EditorState, TextSelection, type Transaction } from 'prosemirror-state';

import { insertHorizontalRule } from './commands';
import { schema } from './schema';

/** 段落，`text` 为空则生成空段落 */
function p(text = '') {
  return schema.nodes.paragraph.create(null, text ? schema.text(text) : []);
}

function doc(...blocks: ReturnType<typeof p>[]) {
  return schema.node('doc', null, blocks);
}

/** 把光标放到 `pos`，并跑一次插入分割线的命令 */
function run(state: EditorState) {
  let tr: Transaction | null = null;
  const handled = insertHorizontalRule()(state, (transaction) => {
    tr = transaction;
  });

  return { handled, next: tr ? state.apply(tr) : null };
}

/** 光标放在 `pos` 的状态 */
function cursorAt(document: ReturnType<typeof doc>, pos: number) {
  return EditorState.create({
    schema,
    doc: document,
    selection: TextSelection.create(document, pos),
  });
}

/** 文档结构摘要，方便断言：段落带文字、分割线记为 `---` */
function shape(document: { childCount: number; child: (index: number) => any }) {
  const parts: string[] = [];

  for (let i = 0; i < document.childCount; i++) {
    const child = document.child(i);
    parts.push(child.type === schema.nodes.horizontal_rule ? '---' : child.textContent);
  }

  return parts;
}

interface Case {
  name: string;
  fn: () => void;
}

const tests: Case[] = [
  {
    name: '分割线：插在当前段落之后，光标落到下一个段落里，不凭空多出段落',
    fn() {
      const state = cursorAt(doc(p('abc'), p('def')), 4);
      const { handled, next } = run(state);

      assert.equal(handled, true);
      assert.ok(next);
      assert.deepEqual(
        shape(next.doc),
        ['abc', '---', 'def'],
        '应该只有一条分割线，没有多余空段落',
      );
      assert.equal(next.selection.$from.parent.textContent, 'def', '光标应该落到分割线下方');
    },
  },
  {
    name: '分割线：光标所在的空段落被顶替，而不是留在分割线上方',
    fn() {
      const state = cursorAt(doc(p()), 1);
      const { next } = run(state);

      assert.ok(next);
      // 顶替空段落 = 分割线占第一块；后面那个空段落是给光标落脚的新段落
      assert.deepEqual(shape(next.doc), ['---', ''], '空段落应该被分割线顶替');
      assert.equal(next.selection.empty, true, '光标停在分割线下方空段落里');
      assert.equal(next.selection.$from.parent.type, schema.nodes.paragraph);
    },
  },
  {
    name: '分割线：文档末尾没有可落脚的段落时补一个',
    fn() {
      const state = cursorAt(doc(p('abc')), 4);
      const { next } = run(state);

      assert.ok(next);
      assert.deepEqual(shape(next.doc), ['abc', '---', ''], '末尾要补一个空段落给光标落脚');
      assert.equal(next.selection.$from.parent.textContent, '');
    },
  },
  {
    name: '分割线：后面紧跟表格时，补的段落落在分割线与表格之间',
    fn() {
      const cell = schema.nodes.table_cell.create(null, [p('x')]);
      const table = schema.nodes.table.create(null, [schema.nodes.table_row.create(null, [cell])]);
      const state = cursorAt(schema.node('doc', null, [p('abc'), table]), 4);
      const { next } = run(state);

      assert.ok(next);
      // 表格是 isolating 块，光标落进去就出不来了，所以补的段落必须夹在中间
      assert.equal(next.doc.child(1).type, schema.nodes.horizontal_rule);
      assert.equal(next.doc.child(2).type, schema.nodes.paragraph);
      assert.equal(next.doc.child(3).type, schema.nodes.table);
      assert.equal(next.selection.$from.parent.type, schema.nodes.paragraph, '光标不该落进表格');
    },
  },
  {
    name: '分割线：代码块里放不下，命令直接拒绝',
    fn() {
      const code = schema.nodes.code_block.create({ language: 'text' }, schema.text('abc'));
      const state = cursorAt(schema.node('doc', null, [code]), 2);
      const { handled, next } = run(state);

      assert.equal(handled, false, '代码块的内容只能是文本');
      assert.equal(next, null, '不该产生事务');
    },
  },
];

/* ----------------------------------------------------------------- runner */

let failed = 0;

for (const { name, fn } of tests) {
  try {
    fn();
    console.log(`\x1b[32m✓\x1b[0m ${name}`);
  } catch (error) {
    failed++;
    console.error(`\x1b[31m✗\x1b[0m ${name}\n    ${(error as Error).message}`);
  }
}

console.log(`\n${tests.length - failed}/${tests.length} 通过`);
process.exitCode = failed ? 1 : 0;
