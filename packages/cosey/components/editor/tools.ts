/**
 * 编辑器「功能」与「工具栏按钮」的唯一 key 清单。
 *
 * `features` 与 `toolbar` 共用这一套 key：
 * - `features` 决定编辑器「能用什么」，未启用的功能不会出现在任何工具栏里；
 * - `toolbar` 决定固定工具栏「显示什么、怎么分组」。
 * 两者取交集后才是最终渲染出来的按钮。
 */
export const EDITOR_TOOLS = [
  // 历史
  'undo',
  'redo',
  // 块级
  'heading',
  'ordered-list',
  'bulleted-list',
  'indent-decrease',
  'indent-increase',
  'align-left',
  'align-center',
  'align-right',
  'align-justify',
  'blockquote',
  'code-block',
  // 行内
  'bold',
  'italic',
  'underline',
  'strikethrough',
  'code',
  'superscript',
  'subscript',
  'font',
  'size',
  'color',
  'background',
  'link',
  // 插入
  'image',
  'video',
  'table',
  'formula',
  // 其他
  'clear',
  'source',
] as const;

export type EditorTool = (typeof EDITOR_TOOLS)[number];

/** 固定工具栏的默认布局：`,` 分隔按钮，`|` 分隔按钮组。 */
export const DEFAULT_EDITOR_TOOLBAR = [
  'undo,redo',
  'heading,font,size',
  'bold,italic,underline,strikethrough,code,color,background',
  'superscript,subscript',
  'ordered-list,bulleted-list',
  'indent-decrease,indent-increase',
  'align-left,align-center,align-right,align-justify',
  'blockquote,code-block',
  'link,image,video,table,formula',
  'clear',
  'source',
].join('|');

/**
 * 功能 → 键盘快捷键。键位写法同 `prosemirror-keymap`（`Mod-` = macOS 的 ⌘ / 其他平台的 Ctrl）。
 *
 * 这张表是快捷键的**唯一声明处**：`pm/plugins.ts` 按它生成 keymap，`features` 关掉某个功能时
 * 对应按键一并失效。只登记「与工具栏按钮对应」的功能 —— 退格、方向键、回车换行这些是编辑基元，
 * 不属于 `features` 的管辖范围，别往这里加。
 */
export const EDITOR_TOOL_SHORTCUTS: Partial<Record<EditorTool, readonly string[]>> = {
  undo: ['Mod-z'],
  redo: ['Mod-y', 'Shift-Mod-z'],
  bold: ['Mod-b'],
  italic: ['Mod-i'],
  underline: ['Mod-u'],
  // Tab 在表格里是换格（属表格能力）、其余位置才是缩进，所以这两条只在缩进分支生效
  'indent-increase': ['Tab'],
  'indent-decrease': ['Shift-Tab'],
};

const allTools = new Set<string>(EDITOR_TOOLS);

function isEditorTool(value: string): value is EditorTool {
  return allTools.has(value);
}

function splitTools(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(isEditorTool);
}

/**
 * 解析 `features`：`,` 分隔的 key 列表。
 * 不传、传空串或只传空白表示不限制（全部功能可用）；无法识别的 key 会被忽略。
 */
export function parseEditorFeatures(value?: string | null): Set<EditorTool> {
  if (!value?.trim()) {
    return new Set(EDITOR_TOOLS);
  }

  return new Set(splitTools(value));
}

/**
 * 解析 `toolbar`：`,` 分隔按钮，`|` 分隔按钮组。
 * 未在 `enabled` 里的按钮、无法识别的 key 会被丢掉，重复的 key 只保留第一次出现的位置，
 * 被丢空的按钮组也一并去掉。返回值为空表示没有可显示的按钮。
 */
export function parseEditorToolbar(
  value: string | null | undefined,
  enabled: Set<EditorTool>,
): EditorTool[][] {
  const source = value?.trim() ? value : DEFAULT_EDITOR_TOOLBAR;
  const seen = new Set<EditorTool>();
  const groups: EditorTool[][] = [];

  for (const group of source.split('|')) {
    const tools: EditorTool[] = [];

    for (const tool of splitTools(group)) {
      if (seen.has(tool) || !enabled.has(tool)) continue;

      seen.add(tool);
      tools.push(tool);
    }

    if (tools.length > 0) {
      groups.push(tools);
    }
  }

  return groups;
}
