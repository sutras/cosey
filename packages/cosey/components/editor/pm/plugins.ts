import { baseKeymap, chainCommands, newlineInCode } from 'prosemirror-commands';
import { history, redo, undo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { splitListItem } from 'prosemirror-schema-list';
import { Plugin, TextSelection, type Command } from 'prosemirror-state';
import {
  columnResizing,
  findTable,
  goToNextCell,
  isInTable,
  selectedRect,
  tableEditing,
} from 'prosemirror-tables';
import { changeIndent, toggleMark } from './commands';
import { prismPlugin } from './prism';
import { schema } from './schema';

/**
 * 未拖拽过的列至少留出这么宽，拖拽手柄才有落点，表格也不会被压成一条线。
 * ContentTable 节点视图同步 colgroup 时要用同一个值。
 */
export const DEFAULT_CELL_MIN_WIDTH = 100;

/**
 * 表格是 isolating 节点，光标进了单元格就出不来：文档末尾如果只留下一个表格，
 * 后面既没有可点的地方、也没有可跳的位置，所以这里保证末尾总有一个可落脚的段落。
 */
function trailingBlockPlugin() {
  return new Plugin({
    appendTransaction(transactions, _oldState, newState) {
      if (!transactions.some((tr) => tr.docChanged)) return null;

      const last = newState.doc.lastChild;
      if (!last || !last.type.spec.isolating) return null;

      return newState.tr
        .insert(newState.doc.content.size, schema.nodes.paragraph.create())
        .setMeta('addToHistory', false);
    },
  });
}

/**
 * 表格是 isolating 节点，方向键要靠相邻的 block 才能把光标送出去。文档以表格开头（或结尾）时
 * 那一侧什么都没有，tableEditing() 的箭头处理会退化成「选中整个表格」，光标就再也出不去了。
 *
 * 这个 keymap 排在 tableEditing() 之前，只在这一种情况下接管：光标贴着表格上/下边缘、
 * 该方向上没有任何兄弟节点 —— 补一个空段落再把光标放进去。
 * 相邻已有内容时返回 false，由 tableEditing() 把光标送到那个 block 里，不凭空插段落。
 */
function moveOutOfTableVertical(direction: -1 | 1): Command {
  return (state, dispatch, view) => {
    if (!state.selection.empty || !isInTable(state)) return false;
    if (view && !view.endOfTextblock(direction < 0 ? 'up' : 'down')) return false;

    const rect = selectedRect(state);
    const atEdge = direction < 0 ? rect.top === 0 : rect.bottom === rect.map.height;
    if (!atEdge) return false;

    // 注意选区的 tableStart 指向表格内容起点，定位相邻兄弟节点要用表格节点自身的位置
    const table = findTable(state.doc.resolve(state.selection.from));
    if (!table) return false;

    const boundary = direction < 0 ? table.pos : table.pos + table.node.nodeSize;
    const $boundary = state.doc.resolve(boundary);

    // 该方向已经有相邻的 block（段落、引用、列表……）时，tableEditing() 能找到落点
    if (direction < 0 ? $boundary.nodeBefore : $boundary.nodeAfter) return false;

    if (!dispatch) return true;

    const tr = state.tr.insert(boundary, schema.nodes.paragraph.create());
    tr.setSelection(TextSelection.near(tr.doc.resolve(boundary + 1), direction)).scrollIntoView();
    dispatch(tr);
    return true;
  };
}

function tableEdgePlugin() {
  return keymap({
    ArrowUp: moveOutOfTableVertical(-1),
    ArrowDown: moveOutOfTableVertical(1),
  });
}

function buildKeymap(): Record<string, Command> {
  return {
    ...baseKeymap,
    Enter: chainCommands(splitListItem(schema.nodes.list_item), baseKeymap.Enter),
    'Mod-z': undo,
    'Mod-y': redo,
    'Shift-Mod-z': redo,
    'Mod-b': toggleMark('strong'),
    'Mod-i': toggleMark('em'),
    'Mod-u': toggleMark('underline'),
    'Shift-Enter': (state, dispatch) => {
      if (state.selection.$from.parent.type.spec.code) {
        return newlineInCode(state, dispatch);
      }

      if (dispatch) {
        dispatch(state.tr.replaceSelectionWith(schema.nodes.hard_break.create()).scrollIntoView());
      }
      return true;
    },
    // 表格内的上下左右移动、跨单元格框选、删除单元格内容都由 tableEditing() 的
    // handleKeyDown 处理（它排在 keymap 之前），这里只需要补上它没管的 Tab 换格。
    Tab: (state, dispatch) => {
      if (isInTable(state)) return goToNextCell(1)(state, dispatch);
      return changeIndent(1)(state, dispatch);
    },
    'Shift-Tab': (state, dispatch) => {
      if (isInTable(state)) return goToNextCell(-1)(state, dispatch);
      return changeIndent(-1)(state, dispatch);
    },
  };
}

export function buildPlugins() {
  return [
    prismPlugin,
    history(),
    // columnResizing 必须排在 tableEditing 之前：mousedown 会先交给它判断是否
    // 落在列宽拖拽手柄上，没命中（返回 false）时才轮到 tableEditing 做单元格框选。
    columnResizing({
      cellMinWidth: 25,
      defaultCellMinWidth: DEFAULT_CELL_MIN_WIDTH,
      lastColumnResizable: true,
    }),
    // 同理，表格边缘的上下方向键要先于 tableEditing() 判断，否则文档首尾是表格时
    // 光标会被困在表格里（见 moveOutOfTableVertical）。
    tableEdgePlugin(),
    tableEditing(),
    trailingBlockPlugin(),
    keymap(buildKeymap()),
  ];
}
