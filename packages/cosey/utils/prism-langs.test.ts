/**
 * utils/prism-langs 回归测试
 *
 * 跑法：`pnpm test:prism`（即 `tsx ./packages/cosey/utils/prism-langs.test.ts`）
 *
 * 钉住的是「静默降级」这一类问题：语言包漏了一个，prism 不会报错，
 * 组件会 fallback 到纯文本，界面上看不出来。历史 bug：highlight 的 Lang 里
 * 声明了 python/py，语言包清单里却没有 prism-python。
 *
 * 关键点：测试**不自己抄一份语言清单**（那又会漂移），而是从源码里抽组件
 * 对外宣称支持的语言，再逐个去 prism 实例上查。
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { prism } from './prism-langs';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(dirname, '..');

function read(rel: string) {
  return fs.readFileSync(path.join(pkgRoot, rel), 'utf8');
}

/** 组件是个带语言的界面：列出所有 runtime 会用到 prism 的源码文件 */
function listSourceFiles(dir: string): string[] {
  return fs
    .readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile() && /\.(ts|tsx|vue)$/.test(e.name) && e.parentPath.includes('cosey'))
    .map((e) => path.join(e.parentPath, e.name))
    .filter((p) => !p.includes('node_modules'));
}

interface Case {
  name: string;
  fn: () => void;
}

const tests: Case[] = [
  {
    name: 'highlight.api 的 Lang 联合类型里每个语言都有 grammar',
    fn() {
      const src = read('components/highlight/highlight.api.ts');

      // type LangText = ...; / type LangXml = ...; / type Lang = ...
      const blocks = [...src.matchAll(/^type (Lang\w*) =([^;]+);/gm)].map((m) => m[2]);
      assert.ok(blocks.length >= 8, `Lang 别名只抽到 ${blocks.length} 个，抽取逻辑可能失效`);

      const langs = [
        ...new Set(blocks.flatMap((b) => [...b.matchAll(/'([a-z0-9]+)'/g)].map((m) => m[1]))),
      ];
      assert.ok(langs.length >= 30, `只抽到 ${langs.length} 个语言字面量`);

      const missing = langs.filter((l) => !(prism.languages as Record<string, unknown>)[l]);
      assert.deepEqual(missing, [], `Lang 里声明了但没注册 grammar: ${missing.join(', ')}`);
    },
  },
  {
    name: 'editor 的 languageOptions 里每个语言都有 grammar',
    fn() {
      const src = read('components/editor/contents/content-code-block.tsx');
      const start = src.indexOf('export const languageOptions = [');
      assert.ok(start !== -1, '没找到 languageOptions');

      const end = src.indexOf('];', start);
      const values = [...src.slice(start, end).matchAll(/\{\s*value:\s*'([^']+)'/g)].map(
        (m) => m[1],
      );
      assert.ok(values.length >= 10, `只抽到 ${values.length} 个选项`);

      const missing = values.filter((l) => !(prism.languages as Record<string, unknown>)[l]);
      assert.deepEqual(
        missing,
        [],
        `languageOptions 里声明了但没注册 grammar: ${missing.join(', ')}`,
      );
    },
  },
  {
    name: '语言包注册到了同一个全局 Prism 实例上',
    fn() {
      const globalPrism = (globalThis as { Prism?: unknown }).Prism;
      assert.equal(globalPrism, prism, 'globalThis.Prism 与导出的 prism 不是同一个实例');
      // 至少有 scss / python / tsx 这几个常用语言，防止清单被整体清空后测试仍绿
      for (const l of ['scss', 'python', 'tsx', 'php', 'sql']) {
        assert.ok((prism.languages as Record<string, unknown>)[l], `缺少语言 ${l}`);
      }
    },
  },
  {
    name: 'prism-langs 里 ./prism 必须排在所有语言包之前',
    fn() {
      const src = read('utils/prism-langs.ts');
      // 只看 import 语句所在的行 —— 文件顶部注释里也会提到 prismjs/components
      const importLines = src
        .split('\n')
        .map((line, index) => ({ line, index }))
        .filter(({ line }) => /^\s*import\s/.test(line));

      const guard = importLines.find(({ line }) => line.includes("from './prism'"));
      const firstPack = importLines.find(({ line }) => line.includes('prismjs/components/'));

      assert.ok(guard, '没找到对 ./prism 的导入');
      assert.ok(firstPack, '没找到任何语言包导入');
      assert.ok(
        guard.index < firstPack.index,
        './prism（建全局）必须写在语言包之前：语言包是直接向全局 Prism 注册的脚本，' +
          '同一模块内所有 import 都在模块体之前求值，顺序反了守卫就来不及',
      );
    },
  },
  {
    name: '除 utils/prism.ts 外不允许再裸引 prismjs 核心',
    fn() {
      const files = listSourceFiles(pkgRoot);
      const offenders: string[] = [];

      for (const file of files) {
        const rel = path.relative(pkgRoot, file);
        if (rel === path.join('utils', 'prism.ts')) continue;
        if (rel.endsWith('.test.ts')) continue;

        const src = fs.readFileSync(file, 'utf8');
        // 值导入：import Prism from 'prismjs' / import 'prismjs'；import type 不算
        const valueImports = [...src.matchAll(/^\s*import\s+(?!type\b)[^;\n]*from\s+'prismjs'/gm)];
        const sideEffect = [...src.matchAll(/^\s*import\s+'prismjs'\s*;?\s*$/gm)];
        if (valueImports.length || sideEffect.length) offenders.push(rel);
      }

      assert.deepEqual(
        offenders,
        [],
        `这些文件裸引了 prismjs 核心，应改为从 utils/prism-langs 取 prism: ${offenders.join(', ')}`,
      );
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
