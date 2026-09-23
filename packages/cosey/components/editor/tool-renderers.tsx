import { type VNode } from 'vue';
import {
  RtiAlignCenter,
  RtiAlignJustify,
  RtiAlignLeft,
  RtiAlignRight,
  RtiBold,
  RtiBulletList,
  RtiIndentDecrease,
  RtiIndentIncrease,
  RtiInlineCode,
  RtiItalic,
  RtiOrderedList,
  RtiStrikethrough,
  RtiSubscript,
  RtiSuperscript,
  RtiUnderline,
} from 'richtext-icons';

import FormatHistory from './formats/format-history';
import FormatHeading from './formats/format-heading';
import FormatFont from './formats/format-font';
import FormatSize from './formats/format-size';
import FormatColor from './formats/format-color';
import FormatBackground from './formats/format-background';
import FormatMark from './formats/format-mark';
import FormatList from './formats/format-list';
import FormatIndent from './formats/format-indent';
import FormatAlign from './formats/format-align';
import FormatBlockQuote from './formats/format-block-quote';
import FormatCodeBlock from './formats/format-code-block';
import FormatLink from './formats/format-link';
import FormatImage from './formats/format-image';
import FormatVideo from './formats/format-video';
import FormatTable from './formats/format-table';
import FormatFormula from './formats/format-formula';
import FormatClear from './formats/format-clear';
import FormatSource from './formats/format-source';

import type { EditorTool } from './tools';

/**
 * 工具的渲染器：一个 key 对应一个按钮组件。
 * 固定工具栏与浮动「行内样式」工具条共用这张表 —— 同一种格式在两种形态下是同一个按钮，
 * 差别只在于放在哪个分组里。
 */
const toolRenderers: Record<EditorTool, (key: EditorTool) => VNode> = {
  undo: (key) => <FormatHistory key={key} direction="undo" />,
  redo: (key) => <FormatHistory key={key} direction="redo" />,

  heading: (key) => <FormatHeading key={key} />,
  'ordered-list': (key) => <FormatList key={key} format="numbered-list" icon={RtiOrderedList} />,
  'bulleted-list': (key) => <FormatList key={key} format="bulleted-list" icon={RtiBulletList} />,
  'indent-decrease': (key) => <FormatIndent key={key} delta={-1} icon={RtiIndentDecrease} />,
  'indent-increase': (key) => <FormatIndent key={key} delta={+1} icon={RtiIndentIncrease} />,
  'align-left': (key) => <FormatAlign key={key} format="left" icon={RtiAlignLeft} />,
  'align-center': (key) => <FormatAlign key={key} format="center" icon={RtiAlignCenter} />,
  'align-right': (key) => <FormatAlign key={key} format="right" icon={RtiAlignRight} />,
  'align-justify': (key) => <FormatAlign key={key} format="justify" icon={RtiAlignJustify} />,
  blockquote: (key) => <FormatBlockQuote key={key} />,
  'code-block': (key) => <FormatCodeBlock key={key} />,

  bold: (key) => <FormatMark key={key} format="bold" icon={RtiBold} />,
  italic: (key) => <FormatMark key={key} format="italic" icon={RtiItalic} />,
  underline: (key) => <FormatMark key={key} format="underline" icon={RtiUnderline} />,
  strikethrough: (key) => <FormatMark key={key} format="strikethrough" icon={RtiStrikethrough} />,
  code: (key) => <FormatMark key={key} format="code" icon={RtiInlineCode} />,
  superscript: (key) => <FormatMark key={key} format="superscript" icon={RtiSuperscript} />,
  subscript: (key) => <FormatMark key={key} format="subscript" icon={RtiSubscript} />,
  font: (key) => <FormatFont key={key} />,
  size: (key) => <FormatSize key={key} />,
  color: (key) => <FormatColor key={key} />,
  background: (key) => <FormatBackground key={key} />,
  link: (key) => <FormatLink key={key} />,

  image: (key) => <FormatImage key={key} />,
  video: (key) => <FormatVideo key={key} />,
  table: (key) => <FormatTable key={key} />,
  formula: (key) => <FormatFormula key={key} />,

  clear: (key) => <FormatClear key={key} />,
  source: (key) => <FormatSource key={key} />,
};

/** 渲染单个工具对应的按钮 */
export function renderEditorTool(tool: EditorTool): VNode {
  return toolRenderers[tool](tool);
}

/** 按给定顺序渲染一组工具按钮 */
export function renderEditorTools(tools: readonly EditorTool[]): VNode[] {
  return tools.map(renderEditorTool);
}
