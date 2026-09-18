import { ref, type Ref } from 'vue';
import { type Mark } from 'prosemirror-model';
import { type Transaction, TextSelection } from 'prosemirror-state';
import { type EditorView } from 'prosemirror-view';
import { redo, undo } from 'prosemirror-history';
import {
  CellSelection,
  addColumnAfter,
  addColumnBefore,
  addRowAfter,
  addRowBefore,
  columnIsHeader,
  deleteColumn,
  deleteRow,
  deleteTable,
  isInTable,
  mergeCells as mergeCellsCommand,
  moveTableColumn as moveTableColumnCommand,
  moveTableRow as moveTableRowCommand,
  rowIsHeader,
  selectedRect,
  selectionCell,
  setCellAttr,
  splitCell as splitCellCommand,
  toggleHeaderCell as toggleHeaderCellCommand,
  toggleHeaderColumn as toggleHeaderColumnCommand,
  toggleHeaderRow as toggleHeaderRowCommand,
} from 'prosemirror-tables';
import { auid } from '../../../utils';
import { type FormatAlign, type HeadingParagraphType, type ListType } from '../types';
import { parseHTML, serializeDoc } from './dom';
import {
  applyTextStyle,
  changeFontSize,
  changeIndent,
  clearFormats,
  getActiveHeadingType,
  getListType,
  getNodeAttrsAt,
  getNodePosAt,
  getTextStyleValue,
  insertAtomNode,
  isBlockStyleActive,
  isInBlockquote,
  isInCodeBlock,
  isMarkActive,
  isNodePointingAt,
  setBlockStyle,
  setHeading,
  toggleBlockQuote,
  toggleCodeBlock,
  toggleList,
  toggleMark,
  updateNodeAttrs,
  type Command,
} from './commands';
import { schema, type CellVerticalAlign, type TextStyleAttrs } from './schema';

const markAliases: Record<string, string> = {
  bold: 'strong',
  italic: 'em',
  underline: 'underline',
  strikethrough: 'strikethrough',
  code: 'code',
  superscript: 'superscript',
  subscript: 'subscript',
};

const textStyleKeyMap: Record<string, keyof TextStyleAttrs> = {
  font: 'fontFamily',
  size: 'fontSize',
  color: 'color',
  background: 'background',
};

const uploadFiles = new Map<string, File>();

export function getUploadFile(id: string): File | undefined {
  return uploadFiles.get(id);
}

function clearUploadFile(id: string) {
  uploadFiles.delete(id);
}

function createCell(type: 'table_cell' | 'table_header' = 'table_cell') {
  return schema.nodes[type].create(null, [schema.nodes.paragraph.create()]);
}

function createRow(columns: number, cellType: 'table_cell' | 'table_header' = 'table_cell') {
  return schema.nodes.table_row.create(
    null,
    Array.from({ length: columns }, () => createCell(cellType)),
  );
}

/** 表格工具条需要的状态快照，随每次事务重建。 */
export interface EditorTableState {
  /** 选中的单元格是否构成可合并的矩形（跨多行或多列） */
  canMergeCells: boolean;
  /** 选中的单元格是否由多行/多列合并而来 */
  canSplitCell: boolean;
  /** 是否处于单元格框选状态 */
  isCellSelection: boolean;
  canMoveRowUp: boolean;
  canMoveRowDown: boolean;
  canMoveColumnLeft: boolean;
  canMoveColumnRight: boolean;
  /** 当前所在行是否为标题行 */
  headerRow: boolean;
  /** 当前所在列是否为标题列 */
  headerColumn: boolean;
  /** 当前单元格是否为标题单元格 */
  headerCell: boolean;
  background: string | null;
  /** 单元格默认文字色（内容继承，run 上的颜色 mark 会覆盖它） */
  color: string | null;
  verticalAlign: CellVerticalAlign | null;
}

export class EditorFacade {
  view!: EditorView;
  version: Ref<number> = ref(0);

  /** 只读/禁用状态，为 false 时丢弃所有文档变更 */
  editable: Ref<boolean> = ref(true);

  get state() {
    return this.view.state;
  }

  dispatch(tr: Transaction) {
    if (!this.editable.value) return;
    this.view.dispatch(tr);
  }

  exec(command: Command): boolean {
    return command(this.state, (tr) => this.dispatch(tr));
  }

  focus() {
    this.view.focus();
  }

  // ===== history =====

  /** 不传 dispatch 时命令只做可达性判断，据此决定按钮是否置灰 */
  canUndo() {
    return undo(this.state);
  }

  canRedo() {
    return redo(this.state);
  }

  undo() {
    this.exec(undo);
  }

  redo() {
    this.exec(redo);
  }

  // ===== marks =====

  toggleMark(name: string) {
    this.exec(toggleMark(markAliases[name] ?? name));
  }

  isMarkActive(name: string) {
    return isMarkActive(this.state, markAliases[name] ?? name);
  }

  getTextStyleValue(key: string) {
    const mapped = textStyleKeyMap[key] ?? (key as keyof TextStyleAttrs);
    return getTextStyleValue(this.state, mapped as 'fontFamily');
  }

  formatFont(value: string) {
    applyTextStyle(this.state, (tr) => this.dispatch(tr), { fontFamily: value || null });
  }

  formatSize(value: string) {
    applyTextStyle(this.state, (tr) => this.dispatch(tr), { fontSize: value || null });
  }

  formatSizeDelta(delta: number, callback: (numSize: number) => void) {
    if (this.state.selection.empty) return;

    const num = changeFontSize(this.state, (tr) => this.dispatch(tr), delta);
    callback(num);
  }

  formatColor(color?: string) {
    applyTextStyle(this.state, (tr) => this.dispatch(tr), { color: color || null });
  }

  formatBackground(color?: string) {
    applyTextStyle(this.state, (tr) => this.dispatch(tr), { background: color || null });
  }

  // ===== blocks =====

  formatHeading(value: HeadingParagraphType) {
    const active = this.getActiveHeadingType();
    this.exec(setHeading(active === value ? 'paragraph' : value));
  }

  getActiveHeadingType(): HeadingParagraphType {
    return getActiveHeadingType(this.state);
  }

  formatBlockQuote() {
    this.exec(toggleBlockQuote());
  }

  isBlockQuoteActive() {
    return isInBlockquote(this.state);
  }

  formatAlign(value: FormatAlign) {
    const active = this.isAlignActive(value);
    this.exec(setBlockStyle('align', active ? null : value));
  }

  isAlignActive(value: FormatAlign) {
    return isBlockStyleActive(this.state, 'align', value);
  }

  formatIndent(delta: number) {
    this.exec(changeIndent(delta));
  }

  formatList(type: ListType) {
    this.exec(toggleList(type));
  }

  getListType(): ListType | undefined {
    return getListType(this.state);
  }

  clearFormats() {
    this.exec(clearFormats());
  }

  // ===== code block =====

  formatCodeBlock() {
    this.exec(toggleCodeBlock());
  }

  isCodeBlockActive() {
    return isInCodeBlock(this.state);
  }

  // ===== link =====

  private getLinkMark(): Mark | null {
    const { state } = this;
    const type = schema.marks.link;
    const { from, to, empty, $from } = state.selection;

    if (empty) {
      return (state.storedMarks ?? $from.marks()).find((mark) => mark.type === type) ?? null;
    }

    // nodesBetween already limits the walk to the nodes overlapping the selection, so a selection
    // starting in the middle of a text node is still matched.
    let found: Mark | null = null;
    state.doc.nodesBetween(from, to, (node) => {
      if (found) return false;
      const mark = node.marks.find((item) => item.type === type);
      if (mark) {
        found = mark;
        return false;
      }
      return true;
    });

    return found;
  }

  // Collect the contiguous text range carrying the given mark, so that the whole link can be
  // located instead of probing the document position by position.
  private expandMarkRange(mark: Mark): { from: number; to: number } {
    const { doc, selection } = this.state;
    const { from, to } = selection;

    const $from = doc.resolve(from);
    const $to = doc.resolve(to);
    const scanFrom = $from.depth > 0 ? $from.before(1) : 0;
    const scanTo = $to.depth > 0 ? $to.after(1) : doc.content.size;

    let runFrom = -1;
    let runTo = 0;
    let range: { from: number; to: number } | null = null;

    doc.nodesBetween(scanFrom, scanTo, (node, pos) => {
      if (range) return false;

      if (!node.isText || !mark.isInSet(node.marks)) {
        runFrom = -1;
        return true;
      }

      if (runFrom < 0 || pos !== runTo) {
        runFrom = pos;
      }
      runTo = pos + node.nodeSize;

      const hit = from === to ? runFrom <= from && from <= runTo : runTo > from && runFrom < to;
      if (hit) {
        range = { from: runFrom, to: runTo };
      }

      return true;
    });

    return range ?? { from, to };
  }

  // Whether the range stays inside a single textblock, which is required to replace it with a
  // single text node.
  private isSameTextblock(from: number, to: number) {
    const $from = this.state.doc.resolve(from);
    const $to = this.state.doc.resolve(to);
    return $from.sameParent($to) && $from.parent.isTextblock;
  }

  // Build the link text node while keeping the other marks already applied at that position.
  private createLinkText(text: string, mark: Mark, pos: number) {
    const $pos = this.state.doc.resolve(pos);
    const marks = ($pos.nodeAfter?.marks ?? []).filter((item) => item.type !== mark.type);
    return schema.text(text, [mark, ...marks]);
  }

  // The link that fully contains the current selection, if any. A selection reaching outside a link
  // is not editing that link, it is the start of a new one.
  private getContainedLink(): { mark: Mark; from: number; to: number } | null {
    const mark = this.getLinkMark();
    if (!mark) return null;

    const { from, to } = this.state.selection;
    const range = this.expandMarkRange(mark);

    // A mark with no text around the selection is not a link in the document.
    if (range.to <= range.from) return null;
    if (range.from > from || range.to < to) return null;

    return { mark, from: range.from, to: range.to };
  }

  formatLink(url: string, target: string, text: string) {
    const { state } = this;
    const linkType = schema.marks.link;
    const mark = linkType.create({ href: url, target });
    const tr = state.tr;
    const current = this.getContainedLink();

    if (current) {
      // Editing a link the selection sits inside: only touch that link's range, never
      // delete/re-insert text.
      const { from, to } = current;

      tr.removeMark(from, to, linkType);
      tr.addMark(from, to, mark);

      if (text && text !== state.doc.textBetween(from, to) && this.isSameTextblock(from, to)) {
        tr.replaceWith(from, to, this.createLinkText(text, mark, from));
      }

      this.dispatch(tr.scrollIntoView());
      return;
    }

    // Creating a link over the selection. Drop any link already covering it first, so that a
    // selection only partly overlapping a link does not end up carrying two link marks.
    const { from, to, empty } = state.selection;
    tr.removeMark(from, to, linkType);

    if (empty) {
      // Text is only inserted when there is nothing to link, which avoids duplicated content.
      if (!text) return;

      tr.insertText(text, from, to);
      tr.addMark(from, from + text.length, mark);
    } else if (!text || text === state.doc.textBetween(from, to)) {
      // Same text: just add the mark so the marks inside the selection survive.
      tr.addMark(from, to, mark);
    } else if (this.isSameTextblock(from, to)) {
      // Rewritten text: replace the selected text only, keeping its other marks.
      tr.replaceWith(from, to, this.createLinkText(text, mark, from));
    } else {
      tr.addMark(from, to, mark);
    }

    this.dispatch(tr.scrollIntoView());
  }

  // Removes the whole link the selection touches, even when the selection only covers part of it.
  unwrapLink() {
    const { state } = this;
    const mark = this.getLinkMark();
    if (!mark) return;

    const { from, to } = this.expandMarkRange(mark);
    this.dispatch(state.tr.removeMark(from, to, schema.marks.link).scrollIntoView());
  }

  isLinkActive() {
    return this.getContainedLink() !== null;
  }

  getLinkAttrs(): { url: string; target: string; text: string } | null {
    const link = this.getContainedLink();
    if (!link) return null;

    return {
      url: link.mark.attrs.href as string,
      target: (link.mark.attrs.target as string) || '_blank',
      text: this.state.doc.textBetween(link.from, link.to, ' '),
    };
  }

  // ===== image / video / formula =====

  insertImage(url: string, file?: File, width?: number | string, height?: number | string) {
    const src = url || '';
    let title: string | null = null;

    if (file) {
      const id = `file:${auid('co-editor')}`;
      uploadFiles.set(id, file);
      title = id;
    }

    const node = schema.nodes.image.create({
      src,
      title,
      alt: null,
      width: width ?? null,
      height: height ?? null,
    });
    this.exec(insertAtomNode(node));
  }

  isImageActive() {
    return isNodePointingAt(this.state, 'image');
  }

  getImageAttrs() {
    return getNodeAttrsAt(this.state, 'image');
  }

  updateImage(attrs: Record<string, any>) {
    const pos = getNodePosAt(this.state, 'image');
    if (pos != null) {
      updateNodeAttrs(this.state, (tr) => this.dispatch(tr), pos, attrs);
    }
  }

  insertVideo(url: string, width?: number | string, height?: number | string) {
    const node = schema.nodes.video.create({
      src: url,
      width: width ?? null,
      height: height ?? null,
    });
    this.exec(insertAtomNode(node));
  }

  isVideoActive() {
    return isNodePointingAt(this.state, 'video');
  }

  getVideoAttrs() {
    return getNodeAttrsAt(this.state, 'video');
  }

  updateVideo(attrs: Record<string, any>) {
    const pos = getNodePosAt(this.state, 'video');
    if (pos != null) {
      updateNodeAttrs(this.state, (tr) => this.dispatch(tr), pos, attrs);
    }
  }

  insertFormula(value: string) {
    if (this.isFormulaActive()) {
      const pos = getNodePosAt(this.state, 'formula');
      if (pos != null) {
        updateNodeAttrs(this.state, (tr) => this.dispatch(tr), pos, { formula: value });
      }
      return;
    }

    const node = schema.nodes.formula.create({ formula: value });
    this.exec(insertAtomNode(node));
  }

  isFormulaActive() {
    return isNodePointingAt(this.state, 'formula');
  }

  getFormulaAttrs() {
    return getNodeAttrsAt(this.state, 'formula');
  }

  // ===== table =====

  insertTable(rows: number, columns: number) {
    const { state } = this;
    const table = schema.nodes.table.create(
      null,
      Array.from({ length: rows }, () => createRow(columns)),
    );

    const tr = state.tr.replaceSelectionWith(table);
    const tableStart = state.selection.from;

    // 表格后面得留一个可落脚的段落。放在同一步事务里，撤销时才能和表格一起回滚，
    // 不然会多出一个空段落（trailingBlockPlugin 只负责兜住外部导入的内容）。
    if (tr.doc.lastChild?.type === schema.nodes.table) {
      tr.insert(tr.doc.content.size, schema.nodes.paragraph.create());
    }

    // 光标落进第一个单元格（table → row → cell → paragraph），插入完就能直接打字。
    const firstCell = Math.min(tableStart + 3, tr.doc.content.size);

    tr.setSelection(TextSelection.near(tr.doc.resolve(firstCell), 1));
    this.dispatch(tr.scrollIntoView());
  }

  private execTableCommand(command: Command) {
    return this.exec(command);
  }

  insertRowAbove() {
    this.execTableCommand(addRowBefore);
  }

  insertRowBelow() {
    this.execTableCommand(addRowAfter);
  }

  deleteRow() {
    this.execTableCommand(deleteRow);
  }

  insertColumnLeft() {
    this.execTableCommand(addColumnBefore);
  }

  insertColumnRight() {
    this.execTableCommand(addColumnAfter);
  }

  deleteColumn() {
    this.execTableCommand(deleteColumn);
  }

  deleteTable() {
    this.execTableCommand(deleteTable);
  }

  // 框选多个单元格后合并成一个；选区不是矩形时命令自身会拒绝执行。
  mergeCells() {
    this.execTableCommand(mergeCellsCommand);
  }

  // 把含有 rowspan/colspan 的单元格拆回一格一格。
  splitCell() {
    this.execTableCommand(splitCellCommand);
  }

  // 表头只在第一行/第一列上有意义，三个命令分别切换行、列、单个单元格。
  toggleHeaderRow() {
    this.execTableCommand(toggleHeaderRowCommand);
  }

  toggleHeaderColumn() {
    this.execTableCommand(toggleHeaderColumnCommand);
  }

  toggleHeaderCell() {
    this.execTableCommand(toggleHeaderCellCommand);
  }

  setCellBackground(color?: string | null) {
    this.execTableCommand(setCellAttr('background', color || null));
  }

  setCellColor(color?: string | null) {
    this.execTableCommand(setCellAttr('color', color || null));
  }

  setCellVerticalAlign(value?: CellVerticalAlign | null) {
    this.execTableCommand(setCellAttr('verticalAlign', value || null));
  }

  isInTable() {
    return isInTable(this.state);
  }

  /** 当前选区所在的表格矩形，不在表格内时返回 null。 */
  private getTableRect() {
    const { state } = this;
    return isInTable(state) ? selectedRect(state) : null;
  }

  // selectionCell 在表格外会抛错，调用前必须确认选区在表格里。
  private getSelectedCell() {
    const { state } = this;
    if (!isInTable(state)) return null;
    return selectionCell(state).nodeAfter;
  }

  getTableState(): EditorTableState | null {
    const { state } = this;
    const rect = this.getTableRect();
    if (!rect) return null;

    const cell = this.getSelectedCell();
    const { top, bottom, left, right, map } = rect;

    return {
      canMergeCells: right - left > 1 || bottom - top > 1,
      canSplitCell: !!cell && (cell.attrs.colspan > 1 || cell.attrs.rowspan > 1),
      isCellSelection: state.selection instanceof CellSelection,
      canMoveRowUp: top > 0,
      // bottom/right 是开区间，等于表格尺寸时说明已经是最后一行/列
      canMoveRowDown: bottom < map.height,
      canMoveColumnLeft: left > 0,
      canMoveColumnRight: right < map.width,
      headerRow: rowIsHeader(map, rect.table, top),
      headerColumn: columnIsHeader(map, rect.table, left),
      headerCell: cell?.type === schema.nodes.table_header,
      background: (cell?.attrs.background as string) || null,
      color: (cell?.attrs.color as string) || null,
      verticalAlign: (cell?.attrs.verticalAlign as CellVerticalAlign) || null,
    };
  }

  private moveTableRow(direction: -1 | 1) {
    const rect = this.getTableRect();
    if (!rect) return;

    const to = direction < 0 ? rect.top - 1 : rect.bottom;
    if (to < 0 || to > rect.map.height - 1) return;

    this.exec(moveTableRowCommand({ from: rect.top, to, select: true }));
  }

  private moveTableColumn(direction: -1 | 1) {
    const rect = this.getTableRect();
    if (!rect) return;

    const to = direction < 0 ? rect.left - 1 : rect.right;
    if (to < 0 || to > rect.map.width - 1) return;

    this.exec(moveTableColumnCommand({ from: rect.left, to, select: true }));
  }

  moveRowUp() {
    this.moveTableRow(-1);
  }

  moveRowDown() {
    this.moveTableRow(1);
  }

  moveColumnLeft() {
    this.moveTableColumn(-1);
  }

  moveColumnRight() {
    this.moveTableColumn(1);
  }

  // ===== serialize =====

  isDocEmpty(): boolean {
    const { doc } = this.state;
    if (doc.childCount !== 1) return false;

    const first = doc.firstChild;
    return (
      !!first &&
      first.type === schema.nodes.paragraph &&
      first.childCount === 0 &&
      !first.attrs.align &&
      !first.attrs.indent
    );
  }

  serialize(): string {
    return serializeDoc(this.state.doc).trim();
  }

  getContent(): string {
    return this.isDocEmpty() ? '' : serializeDoc(this.state.doc).trim();
  }

  setContent(html: string) {
    const doc = parseHTML(html);
    const tr = this.state.tr
      .replaceWith(0, this.state.doc.content.size, doc.content)
      .setMeta('addToHistory', false);
    // 外部传入的值必须落进文档，只读时也要显示内容，所以这里绕开 editable 拦截。
    this.view.dispatch(tr);
  }
}

export { clearUploadFile };
