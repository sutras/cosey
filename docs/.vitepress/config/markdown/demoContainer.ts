import { type MarkdownRenderer } from 'vitepress';
import mdiContainer from 'markdown-it-container';
import fs from 'node:fs';
import path from 'node:path';

export function demoContainer(md: MarkdownRenderer) {
  mdiContainer(md, 'demo', {
    validate(params) {
      return !!params.trim().match(/^demo\s*(.*)$/);
    },

    render(tokens, idx) {
      const m = tokens[idx].info.trim().match(/^demo\s*(.*)$/);

      if (tokens[idx].nesting === 1) {
        const sourceFileToken = tokens[idx + 2];
        const sourceFile = sourceFileToken.children?.[0].content ?? '';
        let source = '';

        if (sourceFileToken.type === 'inline') {
          source = fs.readFileSync(
            path.resolve(process.cwd(), 'docs/examples', `${sourceFile}.vue`),
            'utf-8',
          );
        }

        if (!source) {
          throw new Error(`Incorrect source file: ${sourceFile}`);
        }

        let code = md.render(`\`\`\` vue\n${source}\`\`\``);
        let description = md.render((m && m[1]) || '');

        source = encodeURIComponent(source);
        code = encodeURIComponent(code);
        description = encodeURIComponent(description);

        const displayComponentName = `examples-${sourceFile.replaceAll('/', '-')}`;

        // 示例覆盖了 echarts / 编辑器 / 播放器等等，大多依赖浏览器 API，
        // 放 ClientOnly 里跳过 SSR：正文照常预渲染，示例等水合后再显示。
        // provider 只包示例：布局本身是 VitePress 原生结构，才能原样水合（lean 产物里
        // 静态内容是空占位，一旦整块重渲染，正文就没了）
        return (
          `<component-demo source="${source}" code="${code}" description="${description}">` +
          `<template #display><ClientOnly><component-demo-provider><${displayComponentName} /></component-demo-provider></ClientOnly></template>`
        );
      } else {
        return `</component-demo>\n`;
      }
    },
  });
}
