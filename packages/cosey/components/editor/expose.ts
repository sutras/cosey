import type { EditorExpose } from './editor.api';
import type { EditorFacade } from './pm/editor';

/**
 * 把内部的 `EditorFacade` 收窄成对外暴露的方法集合。
 *
 * 逐条手写而不是直接暴露 facade：facade 上还挂着 `view` / `editable` / `dispatch`
 * 这些内部状态（且 `defineExpose` 会把 ref 解包，直接透传会让 `editable.value` 读不到），
 * 这里显式列一遍，既挡掉内部成员，也让「公开 API 变了」在类型检查时就暴露出来。
 */
export function createEditorExpose(facade: EditorFacade): EditorExpose {
  return {
    focus: () => facade.focus(),
    insertText: (text) => facade.insertText(text),

    canUndo: () => facade.canUndo(),
    canRedo: () => facade.canRedo(),
    undo: () => facade.undo(),
    redo: () => facade.redo(),

    toggleMark: (name) => facade.toggleMark(name),
    isMarkActive: (name) => facade.isMarkActive(name),
    getTextStyleValue: (key) => facade.getTextStyleValue(key),
    formatFont: (value) => facade.formatFont(value),
    formatSize: (value) => facade.formatSize(value),
    formatSizeDelta: (delta, callback) => facade.formatSizeDelta(delta, callback),
    formatColor: (color) => facade.formatColor(color),
    formatBackground: (color) => facade.formatBackground(color),

    formatHeading: (value) => facade.formatHeading(value),
    getActiveHeadingType: () => facade.getActiveHeadingType(),
    formatBlockQuote: () => facade.formatBlockQuote(),
    isBlockQuoteActive: () => facade.isBlockQuoteActive(),
    formatAlign: (value) => facade.formatAlign(value),
    isAlignActive: (value) => facade.isAlignActive(value),
    formatIndent: (delta) => facade.formatIndent(delta),
    formatList: (type) => facade.formatList(type),
    getListType: () => facade.getListType(),
    clearFormats: () => facade.clearFormats(),

    formatCodeBlock: () => facade.formatCodeBlock(),
    isCodeBlockActive: () => facade.isCodeBlockActive(),

    formatLink: (url, target, text) => facade.formatLink(url, target, text),
    unwrapLink: () => facade.unwrapLink(),
    isLinkActive: () => facade.isLinkActive(),
    getLinkAttrs: () => facade.getLinkAttrs(),

    insertImage: (url, file, width, height) => facade.insertImage(url, file, width, height),
    isImageActive: () => facade.isImageActive(),
    getImageAttrs: () => facade.getImageAttrs(),
    updateImage: (attrs) => facade.updateImage(attrs),
    insertVideo: (url, width, height) => facade.insertVideo(url, width, height),
    isVideoActive: () => facade.isVideoActive(),
    getVideoAttrs: () => facade.getVideoAttrs(),
    updateVideo: (attrs) => facade.updateVideo(attrs),
    insertFormula: (value) => facade.insertFormula(value),
    isFormulaActive: () => facade.isFormulaActive(),
    getFormulaAttrs: () => facade.getFormulaAttrs(),
    insertTable: (rows, columns) => facade.insertTable(rows, columns),

    insertRowAbove: () => facade.insertRowAbove(),
    insertRowBelow: () => facade.insertRowBelow(),
    deleteRow: () => facade.deleteRow(),
    insertColumnLeft: () => facade.insertColumnLeft(),
    insertColumnRight: () => facade.insertColumnRight(),
    deleteColumn: () => facade.deleteColumn(),
    deleteTable: () => facade.deleteTable(),
    mergeCells: () => facade.mergeCells(),
    splitCell: () => facade.splitCell(),
    toggleHeaderRow: () => facade.toggleHeaderRow(),
    toggleHeaderColumn: () => facade.toggleHeaderColumn(),
    toggleHeaderCell: () => facade.toggleHeaderCell(),
    setCellBackground: (color) => facade.setCellBackground(color),
    setCellColor: (color) => facade.setCellColor(color),
    setCellVerticalAlign: (value) => facade.setCellVerticalAlign(value),
    isInTable: () => facade.isInTable(),
    getTableState: () => facade.getTableState(),
    moveRowUp: () => facade.moveRowUp(),
    moveRowDown: () => facade.moveRowDown(),
    moveColumnLeft: () => facade.moveColumnLeft(),
    moveColumnRight: () => facade.moveColumnRight(),

    isDocEmpty: () => facade.isDocEmpty(),
    serialize: () => facade.serialize(),
    getContent: () => facade.getContent(),
    setContent: (html) => facade.setContent(html),

    hasTool: (tool) => facade.hasTool(tool),
  };
}
