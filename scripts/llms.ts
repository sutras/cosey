import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * 给 AI 助手准备的文档入口（llms.txt 约定）：
 *
 * - `llms.txt`：组件索引 + 常见误用，够回答「这个库有什么、该怎么用」
 * - `llms-full.txt`：全部组件文档，demo 引用会替换成真实的示例代码
 *
 * 由 `pnpm docs:llms` 生成，`docs:dev` / `docs:build` 前会自动跑一次。
 */

const docsDir = path.resolve(process.cwd(), 'docs');
const markdownDir = path.join(docsDir, 'markdown');
const componentsDir = path.join(markdownDir, 'components');
const guideDir = path.join(markdownDir, 'guide');
const examplesDir = path.join(docsDir, 'examples');
const publicDir = path.join(docsDir, 'public');

const SITE = 'https://docs.cosey.wzt.zone';

/** 放在最前面的硬规则：AI 最容易在这些地方按 Element Plus 的习惯乱写 */
const RULES = `## 先读这几条

- 组件全局已注册，模板里直接写 \`<co-xxx>\`，不需要 import；TSX 里从 \`cosey/components\` 取。
- 中后台页面用 \`co-card\` / \`co-container\` 搭骨架，不要在视图里手写 div 拼卡片。
- 页签要放进卡片头部时用 \`co-card-tabs\` + \`co-card-tab-panel\`，不要用 \`el-tabs\`：它的导航和面板是同一个节点的两个子元素，塞不进卡片的头部和主体。
- 表格用 \`useTable\` + \`<co-table>\`。列的展示写 \`renderer\`（\`text\` / \`date\` / \`datetime\` / \`tag\` / \`boolean\` / \`longtext\` / \`switch\` / \`click\` / \`media\` / \`usd\` / \`cny\` / \`cent\`），别用 \`format\` 或插槽硬拼；\`renderer\` 与 \`format\` 同时写时 \`format\` 会完全接管，列的样式也会丢。
- 操作列用 \`actionColumn: { actions: (row) => [...] }\`，不要再开 \`#action\` 插槽手写 \`<co-table-action>\`。
- 日期范围要拆成两个接口参数时，给字段加 \`split: ['startCreatedAt', 'endCreatedAt']\`，此时不要再写 \`prop\`（拆分后的第一个键就是校验锚点）。
- 图标必须带前缀：\`<co-icon name="co:xxx" />\` 或 \`bi bi-xxx\`，漏了前缀会渲染成空图标。
- 写样式用 token：\`css-var(color-primary)\`、\`css-var(padding)\`，不要写死颜色和间距。
`;

interface DocPage {
  file: string;
  link: string;
  title: string;
  summary: string;
}

function stripCodeFence(text: string) {
  return text.trim().replace(/^```\w*\n?|\n?```$/g, '');
}

function firstParagraph(markdown: string, heading: string) {
  const start = markdown.indexOf(heading);

  if (start === -1) {
    return '';
  }

  const rest = markdown.slice(start + heading.length).trimStart();
  const block = rest.split(/\n{2,}/).shift() ?? '';

  return block.replace(/\s+/g, ' ').trim();
}

/** `# Card 卡片` → 标题原样保留 */
function parseTitle(markdown: string) {
  return markdown.match(/^#\s+(.+)$/m)?.[1].trim() ?? '';
}

/** 把 `::: demo  name  :::` 换成示例的真实源码 */
async function inlineDemos(markdown: string) {
  const pattern = /::: demo\s*\n\s*([\w/-]+)\s*\n\s*:::/g;
  const names = [...markdown.matchAll(pattern)].map((match) => match[1]);
  const sources = new Map<string, string>();

  for (const name of names) {
    const file = path.join(examplesDir, `${name}.vue`);

    try {
      sources.set(name, stripCodeFence(await readFile(file, 'utf-8')));
    } catch {
      sources.set(name, `<!-- 示例源码缺失：${name} -->`);
    }
  }

  return markdown.replace(pattern, (_raw, name: string) => {
    return `\`\`\`vue\n${sources.get(name) ?? ''}\n\`\`\``;
  });
}

async function readPages(dir: string, prefix: string, first: string | null = null) {
  const files = (await readdir(dir)).filter((file) => file.endsWith('.md'));
  const pages: DocPage[] = [];

  for (const file of files) {
    const markdown = await readFile(path.join(dir, file), 'utf-8');
    const title = parseTitle(markdown);

    if (!title) {
      continue;
    }

    pages.push({
      file,
      link: `${prefix}/${file.replace(/\.md$/, '')}`,
      title,
      summary: firstParagraph(markdown, '## 简介'),
    });
  }

  // 概览 / 入门排最前，其余按标题排序：输出稳定，diff 好读
  return pages.sort((a, b) => {
    if (a.file === first) return -1;
    if (b.file === first) return 1;

    return a.title.localeCompare(b.title, 'en');
  });
}

function renderList(pages: DocPage[]) {
  return pages.map((page) => {
    const suffix = page.summary ? `: ${page.summary}` : '';

    return `- [${page.title}](${SITE}${page.link})${suffix}`;
  });
}

async function writeIndex(pages: { components: DocPage[]; guide: DocPage[] }) {
  const lines = [
    '# Cosey',
    '',
    '> 基于 Vue 3 + TypeScript + Element Plus 的中后台组件库与框架。',
    '> 入口：`cosey` / `cosey/components` / `cosey/hooks` / `cosey/utils` / `cosey/store` / `cosey/locale/lang/*`。',
    `> 全量文档：${SITE}/llms-full.txt`,
    '',
    RULES,
    '## 组件',
    '',
    ...renderList(pages.components),
    '',
    '## 指南',
    '',
    ...renderList(pages.guide),
    '',
  ];

  await writeFile(path.join(publicDir, 'llms.txt'), lines.join('\n'), 'utf-8');
}

async function writeFull(pages: DocPage[]) {
  const chunks: string[] = [
    '# Cosey 完整文档',
    '',
    '> 每个组件页的正文，示例代码已内联。索引见 llms.txt。',
    '',
    RULES,
  ];

  for (const page of pages) {
    const markdown = await readFile(path.join(componentsDir, page.file), 'utf-8');

    chunks.push('---', '', `<!-- ${SITE}${page.link} -->`, '', await inlineDemos(markdown));
  }

  await writeFile(path.join(publicDir, 'llms-full.txt'), chunks.join('\n'), 'utf-8');
}

async function main() {
  await mkdir(publicDir, { recursive: true });

  const components = await readPages(componentsDir, '/components', 'overview.md');
  const guide = await readPages(guideDir, '/guide', 'intro.md');

  if (!components.length) {
    throw new Error('没读到任何组件文档，检查 docs/markdown/components');
  }

  await writeIndex({ components, guide });
  await writeFull(components);

  const indexSize = (await stat(path.join(publicDir, 'llms.txt'))).size;
  const fullSize = (await stat(path.join(publicDir, 'llms-full.txt'))).size;

  console.log(
    `llms.txt: ${components.length} 个组件 + ${guide.length} 篇指南 / ${(indexSize / 1024).toFixed(1)} KB，` +
      `llms-full.txt: ${(fullSize / 1024).toFixed(1)} KB`,
  );
}

main();
