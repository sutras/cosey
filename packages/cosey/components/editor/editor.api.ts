import type { ExtractPropTypes, PropType, SlotsType } from 'vue';
import { isString } from '../../utils';
import { DEFAULT_EDITOR_TOOLBAR, type EditorTool } from './tools';
import type { EditorTableState } from './pm/editor';
import type { CellVerticalAlign } from './pm/schema';
import type { FormatAlign, HeadingParagraphType, ListType } from './types';

export const editorProps = {
  modelValue: {
    type: String,
  },
  placeholder: {
    type: String,
  },
  height: {
    type: String,
  },
  maxHeight: {
    type: String,
  },
  readonly: {
    type: Boolean,
  },
  disabled: {
    type: Boolean,
  },
  validateEvent: {
    type: Boolean,
    default: true,
  },
  /**
   * 工具栏展示形态：
   * - `static`（默认）：固定工具栏，常驻在编辑区上方。
   * - `float`：浮动工具栏。选中文本后浮出「行内样式」工具条；鼠标移入编辑器时，
   *   在块级元素左侧浮出「块级菜单」入口按钮，点击弹出上下文菜单。
   */
  mode: {
    type: String as PropType<'static' | 'float'>,
    default: 'static',
  },
  /**
   * 固定工具栏展示的按钮：`,` 分隔按钮，`|` 分隔按钮组。
   * 未在 `features` 里启用的按钮不会出现；传一个不含有效按钮的值（如 `none`）即隐藏工具栏。
   */
  toolbar: {
    type: String,
    default: DEFAULT_EDITOR_TOOLBAR,
  },
  /**
   * 编辑器可使用的功能：`,` 分隔，取值与工具栏按钮 key 相同。
   * 不配置表示不限制；未启用的功能不会出现在固定工具栏、浮动工具条与块级菜单里，
   * 也不能通过粘贴或拖拽触发（如图片）。
   */
  features: {
    type: String,
  },
};

export type EditorProps = ExtractPropTypes<typeof editorProps>;

export interface EditorSlots {
  default: {};
}

export const editorSlots = Object as SlotsType<EditorSlots>;

export const editorEmits = {
  change: (value: string) => isString(value),
  'update:modelValue': (value: string) => isString(value),
};

export type EditorEmits = typeof editorEmits;

/**
 * 通过组件 ref 拿到的编辑器实例，用于在外部触发格式化、插入与查询。
 *
 * 例：`editorRef.value?.insertText('一段文本')`
 */
export interface EditorExpose {
  /** 让编辑器获得焦点 */
  focus(): void;
  /** 在光标处插入纯文本；有选区时替换选区内容。插入点已有的行内样式会被继承 */
  insertText(text: string): void;

  // ===== 历史 =====
  /** 是否可以撤销 */
  canUndo(): boolean;
  /** 是否可以重做 */
  canRedo(): boolean;
  undo(): void;
  redo(): void;

  // ===== 行内样式 =====
  /** 切换行内样式，取值为 `bold` / `italic` / `underline` / `strikethrough` / `code` / `superscript` / `subscript` */
  toggleMark(name: string): void;
  /** 当前选区是否已应用某个行内样式 */
  isMarkActive(name: string): boolean;
  /** 取当前选区的文字样式，取值为 `font` / `size` / `color` / `background` */
  getTextStyleValue(key: string): string;
  /** 设置字体 */
  formatFont(value: string): void;
  /** 设置字号 */
  formatSize(value: string): void;
  /** 按步长增减字号，回调收到调整后的字号 */
  formatSizeDelta(delta: number, callback: (numSize: number) => void): void;
  /** 设置文字颜色，不传表示清除 */
  formatColor(color?: string): void;
  /** 设置文字背景色，不传表示清除 */
  formatBackground(color?: string): void;

  // ===== 块级样式 =====
  /** 设置段落类型，传入当前类型会退回正文 */
  formatHeading(value: HeadingParagraphType): void;
  /** 取光标所在段落的类型 */
  getActiveHeadingType(): HeadingParagraphType;
  /** 切换引用 */
  formatBlockQuote(): void;
  /** 光标是否在引用里 */
  isBlockQuoteActive(): boolean;
  /** 设置对齐方式，重复调用当前对齐会取消对齐 */
  formatAlign(value: FormatAlign): void;
  /** 某个对齐方式是否已生效 */
  isAlignActive(value: FormatAlign): boolean;
  /** 增减缩进层级，`-1` 减少 / `+1` 增加 */
  formatIndent(delta: number): void;
  /** 切换列表，再调用当前列表类型会取消列表 */
  formatList(type: ListType): void;
  /** 取光标所在列表的类型，不在列表里返回 `undefined` */
  getListType(): ListType | undefined;
  /** 清除选区的所有行内样式与块级样式 */
  clearFormats(): void;

  // ===== 代码块 =====
  /** 切换代码块 */
  formatCodeBlock(): void;
  /** 光标是否在代码块里 */
  isCodeBlockActive(): boolean;

  // ===== 链接 =====
  /** 给选区添加链接；选区为空时会插入 `text` 并链接它 */
  formatLink(url: string, target: string, text: string): void;
  /** 去掉当前选区所在的整个链接 */
  unwrapLink(): void;
  /** 当前选区是否在链接里 */
  isLinkActive(): boolean;
  /** 取当前选区的链接信息，不在链接里返回 `null` */
  getLinkAttrs(): { url: string; target: string; text: string } | null;

  // ===== 插入 =====
  /** 插入图片，传 `file` 时会走上传流程 */
  insertImage(url: string, file?: File, width?: number | string, height?: number | string): void;
  /** 光标是否在图片上 */
  isImageActive(): boolean;
  /** 取图片节点的属性，不在图片上返回 `null` */
  getImageAttrs(): Record<string, any> | null;
  /** 更新图片节点的属性 */
  updateImage(attrs: Record<string, any>): void;
  /** 插入视频 */
  insertVideo(url: string, width?: number | string, height?: number | string): void;
  /** 光标是否在视频上 */
  isVideoActive(): boolean;
  /** 取视频节点的属性，不在视频上返回 `null` */
  getVideoAttrs(): Record<string, any> | null;
  /** 更新视频节点的属性 */
  updateVideo(attrs: Record<string, any>): void;
  /** 插入公式；光标在公式上时改为更新它 */
  insertFormula(value: string): void;
  /** 光标是否在公式上 */
  isFormulaActive(): boolean;
  /** 取公式节点的属性，不在公式上返回 `null` */
  getFormulaAttrs(): Record<string, any> | null;
  /** 插入表格，并在表格后补一个可落脚的段落 */
  insertTable(rows: number, columns: number): void;

  // ===== 表格 =====
  insertRowAbove(): void;
  insertRowBelow(): void;
  deleteRow(): void;
  insertColumnLeft(): void;
  insertColumnRight(): void;
  deleteColumn(): void;
  deleteTable(): void;
  /** 合并框选的多个单元格，选区不是矩形时不会执行 */
  mergeCells(): void;
  /** 拆分合并过的单元格 */
  splitCell(): void;
  toggleHeaderRow(): void;
  toggleHeaderColumn(): void;
  toggleHeaderCell(): void;
  /** 设置单元格底色，不传表示清除 */
  setCellBackground(color?: string | null): void;
  /** 设置单元格默认文字色，不传表示清除 */
  setCellColor(color?: string | null): void;
  /** 设置单元格垂直对齐，不传表示清除 */
  setCellVerticalAlign(value?: CellVerticalAlign | null): void;
  /** 光标是否在表格里 */
  isInTable(): boolean;
  /** 取当前表格的状态快照，不在表格里返回 `null` */
  getTableState(): EditorTableState | null;
  moveRowUp(): void;
  moveRowDown(): void;
  moveColumnLeft(): void;
  moveColumnRight(): void;

  // ===== 文档 =====
  /** 文档是否为空（只有一个空段落） */
  isDocEmpty(): boolean;
  /** 序列化当前文档为 HTML */
  serialize(): string;
  /** 取当前内容，空文档返回空串 */
  getContent(): string;
  /** 用 HTML 覆盖整个文档，这次变更不进入撤销历史 */
  setContent(html: string): void;

  // ===== 能力查询 =====
  /** 某个功能是否可用（由 `features` 属性决定） */
  hasTool(tool: EditorTool): boolean;
}
