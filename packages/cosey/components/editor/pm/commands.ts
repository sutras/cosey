import { lift, setBlockType, toggleMark as pmToggleMark, wrapIn } from 'prosemirror-commands';
import { Fragment, type Mark, type Node as PMNode, type NodeType } from 'prosemirror-model';
import { liftListItem, sinkListItem } from 'prosemirror-schema-list';
import { canJoin } from 'prosemirror-transform';
import { CellSelection } from 'prosemirror-tables';
import {
  type EditorState,
  type Transaction,
  NodeSelection,
  TextSelection,
} from 'prosemirror-state';
import {
  type FormatAlign,
  type HeadingParagraphType,
  type ListType,
  mapHeadingTypeToLevel,
  mapLevelToHeadingType,
} from '../types';
import { schema, type TextStyleAttrs } from './schema';

export type Command = (state: EditorState, dispatch?: (tr: Transaction) => void) => boolean;

const textStyleKeys = ['fontFamily', 'fontSize', 'color', 'background'] as const;

const blockStyleNodes = new Set([
  schema.nodes.paragraph,
  schema.nodes.heading,
  schema.nodes.blockquote,
]);

function isBlockStyleNode(node: PMNode) {
  return blockStyleNodes.has(node.type);
}

// ===== marks =====

export function isMarkActive(state: EditorState, name: string): boolean {
  const type = schema.marks[name];
  if (!type) return false;

  const { from, to, empty, $from } = state.selection;
  if (empty) {
    const marks = state.storedMarks ?? $from.marks();
    return marks.some((mark) => mark.type === type);
  }

  return state.doc.rangeHasMark(from, to, type);
}

export function toggleMark(name: string): Command {
  const type = schema.marks[name];
  return (state, dispatch) => (type ? pmToggleMark(type)(state, dispatch) : false);
}

function getActiveTextStyleMark(state: EditorState): Mark | null {
  const type = schema.marks.text_style;
  const { from, to, empty, $from } = state.selection;

  if (empty) {
    return (state.storedMarks ?? $from.marks()).find((mark) => mark.type === type) ?? null;
  }

  let found: Mark | null = null;
  state.doc.nodesBetween(from, to, (node, pos) => {
    if (found) return false;
    const mark = node.marks.find((item) => item.type === type);
    if (mark && pos >= from && pos < to) {
      found = mark;
      return false;
    }
    return true;
  });

  return found;
}

export function getTextStyleValue(state: EditorState, key: (typeof textStyleKeys)[number]): string {
  const mark = getActiveTextStyleMark(state);
  return ((mark?.attrs[key] as string) || '').toString();
}

export function applyTextStyle(
  state: EditorState,
  dispatch?: (tr: Transaction) => void,
  attrs: TextStyleAttrs = {},
): boolean {
  const { empty, from, to } = state.selection;
  if (empty) return false;

  const current = getActiveTextStyleMark(state)?.attrs ?? {};
  const merged: TextStyleAttrs = { ...(current as TextStyleAttrs), ...attrs };

  const hasValue = textStyleKeys.some((key) => merged[key]);

  if (!hasValue) {
    if (dispatch) dispatch(state.tr.removeMark(from, to, schema.marks.text_style));
    return true;
  }

  const mark = schema.marks.text_style.create(merged);
  if (dispatch) dispatch(state.tr.addMark(from, to, mark));
  return true;
}

export function changeFontSize(
  state: EditorState,
  dispatch: (tr: Transaction) => void,
  delta: number,
): number {
  const size = getTextStyleValue(state, 'fontSize');
  let num = parseInt(size, 10);
  if (Number.isNaN(num)) num = 14;

  num = Math.max(0, num + delta);
  applyTextStyle(state, dispatch, { fontSize: `${num}px` });
  return num;
}

// ===== block styles =====

export function setBlockStyle(
  attr: 'align' | 'indent',
  value: FormatAlign | number | null,
): Command {
  return (state, dispatch) => {
    const { from, to } = state.selection;
    let applicable = false;
    const tr = state.tr;

    state.doc.nodesBetween(from, to, (node, pos) => {
      if (!node.isBlock || !isBlockStyleNode(node)) return true;

      applicable = true;
      tr.setNodeMarkup(pos, undefined, { ...node.attrs, [attr]: value });
      return true;
    });

    if (!applicable) return false;
    if (dispatch) dispatch(tr.scrollIntoView());
    return true;
  };
}

export function isBlockStyleActive(
  state: EditorState,
  attr: 'align' | 'indent',
  value: string | number,
): boolean {
  const { from, to } = state.selection;
  let active = false;

  state.doc.nodesBetween(from, to, (node) => {
    if (active) return false;
    if (node.isBlock && isBlockStyleNode(node) && node.attrs[attr] === value) {
      active = true;
      return false;
    }
    return true;
  });

  return active;
}

export function changeIndent(delta: number): Command {
  return (state, dispatch) => {
    if (getListType(state)) {
      const command =
        delta > 0 ? sinkListItem(schema.nodes.list_item) : liftListItem(schema.nodes.list_item);
      command(state, dispatch);
      return true;
    }

    const { from, to } = state.selection;
    let applicable = false;
    const tr = state.tr;

    state.doc.nodesBetween(from, to, (node, pos) => {
      if (!node.isBlock || !isBlockStyleNode(node)) return true;

      const indent = Math.max(0, (node.attrs.indent || 0) + delta);
      if (indent === node.attrs.indent) return true;

      applicable = true;
      tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent });
      return true;
    });

    if (!applicable) return false;
    if (dispatch) dispatch(tr.scrollIntoView());
    return true;
  };
}

// ===== heading / blockquote / list =====

export function getActiveHeadingType(state: EditorState): HeadingParagraphType {
  const { $from } = state.selection;

  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth);
    if (node.type === schema.nodes.heading) {
      return mapLevelToHeadingType[node.attrs.level as number] ?? 'paragraph';
    }
    if (node.isBlock) return 'paragraph';
  }

  return 'paragraph';
}

export function setHeading(value: HeadingParagraphType): Command {
  if (value === 'paragraph') return setBlockType(schema.nodes.paragraph);

  const level = mapHeadingTypeToLevel[value as keyof typeof mapHeadingTypeToLevel];
  return setBlockType(schema.nodes.heading, { level });
}

export function isInBlockquote(state: EditorState): boolean {
  const { from, to } = state.selection;
  let active = false;

  state.doc.nodesBetween(from, to, (node) => {
    if (active) return false;
    if (node.type === schema.nodes.blockquote) {
      active = true;
      return false;
    }
    return true;
  });

  return active;
}

function joinAdjacentSiblings(tr: Transaction, type: NodeType) {
  for (let i = 0; i < 100; i++) {
    const { $from } = tr.selection;
    let depth: number | null = null;
    for (let d = $from.depth; d > 0; d--) {
      if ($from.node(d).type === type) {
        depth = d;
        break;
      }
    }
    if (depth == null) return;

    const after = $from.after(depth);
    const $after = tr.doc.resolve(after);
    if ($after.nodeAfter?.type === type && canJoin(tr.doc, after)) {
      tr.join(after);
      continue;
    }

    const before = $from.before(depth);
    const $before = tr.doc.resolve(before);
    if ($before.nodeBefore?.type === type && canJoin(tr.doc, before)) {
      tr.join(before);
      continue;
    }

    return;
  }
}

function wrapWithJoin(wrap: Command, type: NodeType): Command {
  return (state, dispatch) => {
    let tr!: Transaction;
    const ok = wrap(state, (t) => {
      tr = t;
    });
    if (!ok) return false;
    joinAdjacentSiblings(tr, type);
    if (dispatch) dispatch(tr.scrollIntoView());
    return true;
  };
}

export function toggleBlockQuote(): Command {
  return (state, dispatch) => {
    if (isInBlockquote(state)) return lift(state, dispatch);
    return wrapWithJoin(wrapIn(schema.nodes.blockquote), schema.nodes.blockquote)(state, dispatch);
  };
}

export function getListType(state: EditorState): ListType | undefined {
  const { $from } = state.selection;

  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth);
    if (node.type === schema.nodes.bullet_list) return 'bulleted-list';
    if (node.type === schema.nodes.ordered_list) return 'numbered-list';
  }

  return undefined;
}

function collectListItems(node: PMNode, items: PMNode[]) {
  if (node.type === schema.nodes.list_item) {
    items.push(node.type.create(node.attrs, node.content));
    return;
  }

  if (node.type === schema.nodes.bullet_list || node.type === schema.nodes.ordered_list) {
    node.forEach((child) => collectListItems(child, items));
    return;
  }

  let content = Fragment.from(node);
  if (content.firstChild?.type !== schema.nodes.paragraph) {
    content = Fragment.from(schema.nodes.paragraph.create()).append(content);
  }
  items.push(schema.nodes.list_item.create(null, content));
}

function setListType(listType: NodeType): Command {
  return (state, dispatch) => {
    const { $from, $to } = state.selection;
    const range = $from.blockRange($to);
    if (!range) return false;

    const parent = range.parent;
    let replaceFrom: number;
    let replaceTo: number;
    let listNode: PMNode | null = null;

    if (parent.type === schema.nodes.bullet_list || parent.type === schema.nodes.ordered_list) {
      replaceFrom = $from.before(range.depth);
      replaceTo = $from.after(range.depth);
      listNode = parent;
    } else if (parent.type === schema.nodes.list_item) {
      replaceFrom = $from.before(range.depth - 1);
      replaceTo = $from.after(range.depth - 1);
      listNode = $from.node(range.depth - 1);
    } else {
      replaceFrom = range.start;
      replaceTo = range.end;
    }

    const items: PMNode[] = [];
    if (listNode) {
      listNode.forEach((child) => collectListItems(child, items));
    } else {
      for (let i = range.startIndex; i < range.endIndex; i++) {
        collectListItems(parent.child(i), items);
      }
    }

    if (!dispatch) return true;

    const tr = state.tr;
    tr.replaceWith(replaceFrom, replaceTo, listType.create(null, Fragment.from(items)));
    tr.setSelection(TextSelection.near(tr.doc.resolve(replaceFrom + 1)));
    joinAdjacentSiblings(tr, listType);
    dispatch(tr.scrollIntoView());
    return true;
  };
}

export function toggleList(type: ListType): Command {
  const listType = type === 'numbered-list' ? schema.nodes.ordered_list : schema.nodes.bullet_list;
  const itemType = schema.nodes.list_item;

  return (state, dispatch) => {
    const { $from, $to } = state.selection;
    const range = $from.blockRange($to);
    if (!range) return false;

    if (
      (range.parent.type === listType || range.parent.type === itemType) &&
      getListType(state) === type
    ) {
      return liftListItem(itemType)(state, dispatch);
    }

    return setListType(listType)(state, dispatch);
  };
}

// ===== code block =====

export function isInCodeBlock(state: EditorState): boolean {
  const { from, to } = state.selection;
  let active = false;

  state.doc.nodesBetween(from, to, (node) => {
    if (active) return false;
    if (node.type === schema.nodes.code_block) {
      active = true;
      return false;
    }
    return true;
  });

  return active;
}

export function toggleCodeBlock(): Command {
  return (state, dispatch) => {
    if (isInCodeBlock(state)) {
      const { from, to } = state.selection;
      let done = false;
      const tr = state.tr;

      state.doc.nodesBetween(from, to, (node, pos) => {
        if (node.type !== schema.nodes.code_block) return true;

        const text = node.textContent;
        const paragraph = schema.nodes.paragraph.create(null, text ? [schema.text(text)] : []);
        tr.replaceWith(pos, pos + node.nodeSize, paragraph);
        done = true;
        return false;
      });

      if (!done) return false;
      if (dispatch) dispatch(tr.scrollIntoView());
      return true;
    }

    const { from, to, empty } = state.selection;
    if (empty) {
      return setBlockType(schema.nodes.code_block, { language: 'text' })(state, dispatch);
    }

    const text = state.doc.textBetween(from, to, '\n');
    const codeBlock = schema.nodes.code_block.create(
      { language: 'text' },
      text ? [schema.text(text)] : [],
    );

    if (dispatch) dispatch(state.tr.replaceRangeWith(from, to, codeBlock).scrollIntoView());
    return true;
  };
}

export function insertNewlineInCode(
  state: EditorState,
  dispatch?: (tr: Transaction) => void,
): boolean {
  const { $head, $anchor } = state.selection;
  if (!$head.parent.type.spec.code || !$anchor.parent.type.spec.code) return false;

  if (dispatch) {
    dispatch(state.tr.replaceSelectionWith(schema.text('\n')).scrollIntoView());
  }
  return true;
}

// ===== atom nodes =====

export function isNodeSelected(state: EditorState, name: string): boolean {
  const { selection } = state;
  return selection instanceof NodeSelection && selection.node.type === schema.nodes[name];
}

export function isNodePointingAt(state: EditorState, name: string): boolean {
  const type = schema.nodes[name];
  if (!type) return false;

  const { selection } = state;
  if (selection instanceof NodeSelection) return selection.node.type === type;
  if (!selection.empty) return false;

  const $pos = selection.$from;
  return $pos.nodeAfter?.type === type || $pos.nodeBefore?.type === type;
}

export function getNodePosAt(state: EditorState, name: string): number | null {
  const type = schema.nodes[name];
  if (!type) return null;

  const { selection } = state;
  if (selection instanceof NodeSelection) {
    return selection.node.type === type ? selection.from : null;
  }

  if (!selection.empty) return null;
  const $pos = selection.$from;
  if ($pos.nodeAfter?.type === type) return $pos.pos + 1;
  if ($pos.nodeBefore?.type === type) return $pos.pos - $pos.nodeBefore.nodeSize;
  return null;
}

export function getNodeAttrsAt(state: EditorState, name: string): Record<string, any> | null {
  const type = schema.nodes[name];
  if (!type) return null;

  const { selection } = state;
  if (selection instanceof NodeSelection) {
    return selection.node.type === type ? selection.node.attrs : null;
  }

  if (!selection.empty) return null;
  const $pos = selection.$from;
  if ($pos.nodeAfter?.type === type) return $pos.nodeAfter.attrs;
  if ($pos.nodeBefore?.type === type) return $pos.nodeBefore.attrs;
  return null;
}

export function updateNodeAttrs(
  state: EditorState,
  dispatch: (tr: Transaction) => void,
  pos: number,
  attrs: Record<string, any>,
): boolean {
  const node = state.doc.nodeAt(pos);
  if (!node) return false;

  dispatch(state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...attrs }).scrollIntoView());
  return true;
}

export function insertAtomNode(node: PMNode): Command {
  return (state, dispatch) => {
    if (dispatch) {
      const tr = state.tr.replaceSelectionWith(node);
      const pos = tr.selection.to;
      const $pos = tr.doc.resolve(pos);
      tr.setSelection(TextSelection.near($pos, 1));
      dispatch(tr.scrollIntoView());
    }
    return true;
  };
}

// ===== clear formats =====

/**
 * 要清理的区间。框选单元格（CellSelection）时选区只是两个单元格的位置，
 * 直接拿 from/to 清只会覆盖到其中一个单元格，所以按单元格逐个展开。
 */
function getClearRanges(state: EditorState): { from: number; to: number }[] | null {
  const { selection } = state;

  if (selection instanceof CellSelection) {
    const ranges: { from: number; to: number }[] = [];
    selection.forEachCell((node, pos) => {
      ranges.push({ from: pos + 1, to: pos + node.nodeSize - 1 });
    });
    return ranges;
  }

  if (selection.empty) return null;
  return [{ from: selection.from, to: selection.to }];
}

export function clearFormats(): Command {
  return (state, dispatch) => {
    const ranges = getClearRanges(state);
    if (!ranges) return false;

    const tr = state.tr;

    ranges.forEach(({ from, to }) => {
      tr.removeMark(from, to, null);

      state.doc.nodesBetween(from, to, (node, pos) => {
        if (node.isBlock && isBlockStyleNode(node) && pos >= from && pos + node.nodeSize <= to) {
          tr.setNodeMarkup(pos, undefined, { ...node.attrs, align: null, indent: 0 });
        }
        return true;
      });
    });

    if (dispatch) dispatch(tr.scrollIntoView());
    return true;
  };
}
