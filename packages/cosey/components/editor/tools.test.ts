/**
 * components/editor/tools 回归测试
 *
 * 跑法：`pnpm test:editor`
 *
 * 钉住四类问题：
 * 1. `features` / `toolbar` 的解析契约（空值语义、非法 key、分组、去重、与 features 取交集）；
 * 2. 新增功能 key 时忘了补默认工具栏布局 —— 表现为默认配置下按钮「悄悄没了」；
 * 3. 新增功能 key 时忘了补渲染器 —— 表现为点了没反应（`renderEditorTool` 取到 undefined）；
 * 4. 快捷键没跟 `features` 收敛 —— 表现为工具栏上按钮没了、按键却照样生效。
 *
 * 渲染器清单与快捷键清单**都不抄一份**（那又会漂移），而是分别从源码里抽 / 直接用源码里的表。
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { EditorState, TextSelection, type Transaction } from 'prosemirror-state';

import {
  DEFAULT_EDITOR_TOOLBAR,
  EDITOR_TOOLS,
  EDITOR_TOOL_SHORTCUTS,
  parseEditorFeatures,
  parseEditorToolbar,
  type EditorTool,
} from './tools';
import { buildKeymap } from './pm/plugins';
import { INDENT_DELTA, schema } from './pm/schema';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const allTools = new Set<EditorTool>(EDITOR_TOOLS);

/** 全部功能都开 / 全部关掉的两个 keymap，用来对照守卫行为 */
const allOn = () => buildKeymap(() => true);
const allOff = () => buildKeymap(() => false);

/** 一个「选中了一些文字」的编辑器状态；`indent` 让「减少缩进」也有可减的余地 */
function createState(indent = 0) {
  const text = 'hello';
  const doc = schema.node('doc', null, [
    schema.nodes.paragraph.create({ indent }, schema.text(text)),
  ]);
  return EditorState.create({
    schema,
    doc,
    selection: TextSelection.create(doc, 1, 1 + text.length),
  });
}

/** 快捷键清单拍平成 [键位, 功能] 列表 */
function shortcutList() {
  return EDITOR_TOOLS.flatMap((tool) =>
    (EDITOR_TOOL_SHORTCUTS[tool] ?? []).map((key) => ({ tool, key })),
  );
}

/**
 * 收集命令产生的事务。命令是回调解耦的，事务得装进盒子再断言 —— 直接用
 * `let tr = null` 的话 TypeScript 看不见回调里的赋值，`assert.ok(tr)` 会把它收窄成 never。
 */
function collect() {
  const box: { tr: Transaction | null } = { tr: null };

  return {
    box,
    dispatch: (tr: Transaction) => {
      box.tr = tr;
    },
  };
}

/** 把分组结果拍平，方便断言 */
function flat(groups: EditorTool[][]) {
  return groups.flat();
}

/** 默认布局展开成的分组 */
function defaultGroups(enabled: Set<EditorTool> = allTools) {
  return parseEditorToolbar(DEFAULT_EDITOR_TOOLBAR, enabled);
}

interface Case {
  name: string;
  fn: () => void;
}

const tests: Case[] = [
  {
    name: 'features：不传 / 空串 / 纯空白都表示不限制',
    fn() {
      for (const value of [undefined, null, '', '   ', '\n']) {
        assert.deepEqual(
          [...parseEditorFeatures(value)].sort(),
          [...allTools].sort(),
          `features=${JSON.stringify(value)} 应该放开全部功能`,
        );
      }
    },
  },
  {
    name: 'features：逗号分隔、忽略非法 key 与空白',
    fn() {
      const enabled = parseEditorFeatures(' bold , italic ,, code , 不存在的功能 ');

      assert.deepEqual([...enabled].sort(), ['bold', 'code', 'italic'], '应该只留下能识别的 key');
    },
  },
  {
    name: 'features：配置了就只放开配置的功能',
    fn() {
      const enabled = parseEditorFeatures('bold');

      assert.equal(enabled.has('bold'), true);
      assert.equal(enabled.has('italic'), false, '没配置的功能不应可用');
      assert.equal(enabled.size, 1);
    },
  },
  {
    name: 'toolbar：不传 / 空白都回落默认布局，且按 `|` 分组',
    fn() {
      const groups = parseEditorToolbar(undefined, allTools);

      assert.ok(groups.length > 1, '默认布局应该有多个按钮组');
      assert.deepEqual(groups[0], ['undo', 'redo']);
      assert.deepEqual(groups[1], ['heading', 'font', 'size']);

      for (const value of [undefined, null, '', '  ']) {
        assert.deepEqual(
          flat(parseEditorToolbar(value, allTools)),
          flat(defaultGroups()),
          `toolbar=${JSON.stringify(value)} 应该等价于显式传默认布局`,
        );
      }
    },
  },
  {
    name: 'toolbar：功能没开启的按钮不出现，被过滤空的组也一起消失',
    fn() {
      const groups = parseEditorToolbar('bold,italic|image,video', parseEditorFeatures('bold'));

      assert.deepEqual(groups, [['bold']], 'image/video 未启用，第二个组应该整组消失');
    },
  },
  {
    name: 'toolbar：无法识别的 key 与重复 key 都不会渲染出来',
    fn() {
      const groups = parseEditorToolbar('bold,加粗|bold|italic', allTools);

      assert.deepEqual(
        groups,
        [['bold'], ['italic']],
        '非法 key 要丢掉，重复的 bold 只保留第一次出现的位置',
      );
    },
  },
  {
    name: 'toolbar：传了值但一个有效按钮都没有时，工具栏应当为空',
    fn() {
      assert.deepEqual(parseEditorToolbar('none', allTools), [], '非法 key 应当被丢掉');
      assert.deepEqual(parseEditorToolbar('|', allTools), [], '只有分组符也是空');
      assert.deepEqual(
        parseEditorToolbar('image,video', parseEditorFeatures('bold')),
        [],
        '按钮都在，但功能都没开，结果同样为空',
      );
    },
  },
  {
    name: '默认布局覆盖全部 key（新增功能要同步补进默认工具栏）',
    fn() {
      const inDefault = new Set(flat(defaultGroups()));
      const missing = EDITOR_TOOLS.filter((tool) => !inDefault.has(tool));

      assert.deepEqual(
        missing,
        [],
        `这些 key 没进默认工具栏布局，默认配置下会看不到入口: ${missing.join(', ')}`,
      );
    },
  },
  {
    name: '每个 key 都有对应的渲染器（新增功能要同步补按钮）',
    fn() {
      const source = fs.readFileSync(path.join(dirname, 'tool-renderers.tsx'), 'utf8');

      // toolRenderers 表里每一行长这样：  undo: (key) => <FormatHistory key={key} ... />
      const rendered = [...source.matchAll(/^\s{2}'?([\w-]+)'?:\s*\(key\)\s*=>/gm)].map(
        (match) => match[1],
      );

      assert.ok(
        rendered.length >= EDITOR_TOOLS.length,
        `只从源码里抽到 ${rendered.length} 个渲染器，抽取逻辑可能失效`,
      );

      const missing = EDITOR_TOOLS.filter((tool) => !rendered.includes(tool));
      assert.deepEqual(
        missing,
        [],
        `这些 key 在 tool-renderers.tsx 里没有渲染器: ${missing.join(', ')}`,
      );

      const redundant = rendered.filter((tool) => !allTools.has(tool as EditorTool));
      assert.deepEqual(
        redundant,
        [],
        `tool-renderers.tsx 里有不在 EDITOR_TOOLS 里的 key: ${redundant.join(', ')}`,
      );
    },
  },
  {
    name: '快捷键：清单里的都是合法功能，且都真的在 keymap 里绑上了键',
    fn() {
      const bound = allOn();
      const shortcuts = shortcutList();

      assert.ok(shortcuts.length > 0, '快捷键清单不该是空的');

      for (const { tool, key } of shortcuts) {
        assert.ok(allTools.has(tool), `EDITOR_TOOL_SHORTCUTS 里的 ${tool} 不是合法功能`);
        assert.ok(bound[key], `${tool} 声明了 ${key}，但 keymap 里没绑定`);
      }
    },
  },
  {
    name: '快捷键：功能没开时按键被吞掉（返回 true 且不产生事务）',
    fn() {
      const keymap = allOff();
      const state = createState();

      for (const { tool, key } of shortcutList()) {
        const command = keymap[key];
        assert.ok(command, `${key} 没绑定命令`);

        const { box, dispatch } = collect();
        const handled = command(state, dispatch, undefined);

        // 这里必须返回 true 而不是 false：返回 false 会把事件让给浏览器，而 contenteditable 里
        // 原生 execCommand 改出来的 DOM 仍会被 ProseMirror 解析回文档
        // （实测：关掉加粗后按 ⌘+B 依然产出 <strong>），features 就永远关不干净。
        assert.equal(handled, true, `${tool} 关掉后按 ${key} 应该吞掉按键而不是放行`);
        assert.equal(box.tr, null, `${tool} 关掉后按 ${key} 不该产生事务`);
      }
    },
  },
  {
    name: '快捷键：功能开着时按键照常生效',
    fn() {
      const keymap = allOn();

      // 撤销/重做要在 history() 插件 + 已有历史的真实会话里才有意义，裸状态下断言不了
      const skippable = new Set<EditorTool>(['undo', 'redo']);

      for (const { tool, key } of shortcutList()) {
        if (skippable.has(tool)) continue;

        const command = keymap[key];
        assert.ok(command, `${key} 没绑定命令`);

        // 减少缩进得先有缩进，否则命令本来就没什么可执行的
        const state = createState(tool === 'indent-decrease' ? INDENT_DELTA : 0);

        const { box, dispatch } = collect();
        command(state, dispatch, undefined);

        assert.ok(box.tr, `功能开着时按 ${key} 应该产生事务（${tool}）`);
        assert.equal(box.tr.docChanged, true, `${key} 应该真的改到文档`);
      }
    },
  },
  {
    name: '快捷键：编辑基元不受 features 影响',
    fn() {
      // 退格、回车、全选这些是「编辑器之所以是编辑器」，关掉功能不该把它们一起关掉
      const primitives = [
        'Backspace',
        'Delete',
        'Enter',
        'Mod-Enter',
        'Mod-a',
        'Shift-Enter',
        'Tab',
      ];

      for (const keymap of [allOn(), allOff()]) {
        for (const key of primitives) {
          assert.ok(keymap[key], `${key} 是编辑基元，不该因为 features 而缺失`);
        }
      }
    },
  },
  {
    name: '快捷键：关掉缩进后，表格里的 Tab 仍然能换格',
    fn() {
      const cell = () =>
        schema.nodes.table_cell.create(null, [
          schema.nodes.paragraph.create(null, schema.text('x')),
        ]);
      const row = () => schema.nodes.table_row.create(null, [cell(), cell()]);
      const table = schema.nodes.table.create(null, [row(), row()]);
      const doc = schema.node('doc', null, [table, schema.nodes.paragraph.create()]);

      // 光标落在第一个单元格的文字里
      const state = EditorState.create({
        schema,
        doc,
        selection: TextSelection.near(doc.resolve(4), 1),
      });

      const command = allOff().Tab;
      assert.ok(command, 'Tab 没绑定命令');

      const { box, dispatch } = collect();
      command(state, dispatch, undefined);

      // Tab 有两条分支：换格属表格能力、缩进属 indent-* 功能。守卫只能加在缩进那条分支上，
      // 整键统一收敛会把「关掉缩进」变成「表格里也不能换格」。
      assert.ok(box.tr, '缩进关掉后，表格里的 Tab 不该被一起关掉');
      assert.equal(box.tr.docChanged, false, '换格只改选区，不改文档');
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
