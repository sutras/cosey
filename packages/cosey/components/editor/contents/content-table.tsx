import {
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
  watch,
  type PropType,
} from 'vue';
import { ElPopover } from 'element-plus';
import { type Node as PMNode } from 'prosemirror-model';
import { type EditorView } from 'prosemirror-view';
import { CellSelection, columnResizingPluginKey, updateColumnsOnResize } from 'prosemirror-tables';
import { createBem } from '../../../utils';
import { useEditor } from '../pm/context';
import { viewVersion } from '../pm/reactive-view';
import { DEFAULT_CELL_MIN_WIDTH } from '../pm/plugins';
import { type EditorTableState } from '../pm/editor';
import { Icon } from '../../icon';
import ButtonGroup from '../ui/button-group';
import Button from '../ui/button';
import ColorPicker from '../ui/color-picker';
import ButtonGroupList from '../ui/button-group-list';
import {
  RtiAlignBottom,
  RtiAlignCenterVertical,
  RtiAlignTop,
  RtiCellBackground,
  RtiCellHeader,
  RtiCellTextColor,
  RtiColumnDelete,
  RtiColumnHeader,
  RtiColumnInsert,
  RtiColumnInsertLeft,
  RtiColumnMoveLeft,
  RtiColumnMoveRight,
  RtiMergeCells,
  RtiRowDelete,
  RtiRowHeader,
  RtiRowInsert,
  RtiRowInsertAbove,
  RtiRowMoveDown,
  RtiRowMoveUp,
  RtiSplitCells,
  RtiTableDelete,
} from 'richtext-icons';

/**
 * 工具条默认贴在表格上方，但编辑区上方空间不足时（表格就是文档第一块）它会盖住
 * 编辑器自己的工具条，这时改成放到表格下方。
 */
const TOOLBAR_GAP = 12;
/** 工具条尺寸还没量到时先按两行估算 —— 宁可高估，也不要盖住编辑器工具条 */
const TOOLBAR_HEIGHT_FALLBACK = 96;

function isSameTableState(a: EditorTableState | null, b: EditorTableState | null) {
  if (a === b) return true;
  if (!a || !b) return false;

  return (Object.keys(a) as (keyof EditorTableState)[]).every((key) => a[key] === b[key]);
}

export default defineComponent({
  name: 'CoEditorContentTable',
  props: {
    node: { type: Object as PropType<PMNode>, required: true },
    getNode: { type: Function as PropType<() => PMNode>, required: true },
    view: { type: Object as PropType<EditorView>, required: true },
    getPos: { type: Function as PropType<() => number | undefined>, required: true },
    selected: { type: Boolean },
    registerEl: {
      type: Function as PropType<(el: HTMLElement | null) => void>,
      required: true,
    },
    registerContent: {
      type: Function as PropType<(el: HTMLElement | null) => void>,
      required: true,
    },
  },
  setup(props) {
    const bem = createBem('editor-content-table');

    const editor = useEditor();

    const tableEl = ref<HTMLTableElement>();
    const colgroupEl = ref<HTMLTableColElement>();
    const state = ref<EditorTableState | null>(null);
    const colorVisible = ref(false);
    const textColorVisible = ref(false);
    const placement = ref<'top' | 'bottom'>('top');
    // 是否正在跨单元格框选：期间要禁掉浏览器原生的文本选择
    const draggingCells = ref(false);
    /** 点到了编辑器外面：选区不会变（PM 保留原选区）、也就没有事务，只能自己记一下收起状态 */
    const dismissed = ref(false);

    // 工具条的宽度固定（max-width），高度只跟换行有关，量一次就能稳定复用
    const toolbarRef = useTemplateRef<HTMLElement>('tableToolbar');

    // 节点视图的根节点是外面这层 div：columnResizing 靠它做横向滚动，
    // <table> 留在里面且第一个子节点必须是 <colgroup>（插件直接按这个结构读写列宽）。
    const setWrapper = (el: any) => {
      props.registerEl(el as HTMLElement | null);
    };

    const setTable = (el: any) => {
      tableEl.value = (el as HTMLTableElement) || undefined;
    };

    const setColgroup = (el: any) => {
      colgroupEl.value = (el as HTMLTableColElement) || undefined;
    };

    // props.node 是 Vue 侧的浅引用，只在 markup 变化时才更新；
    // 列宽同步始终从最新的 state 里取节点，避免读到过期的 colwidth。
    const getTableNode = () => {
      const pos = props.getPos();
      if (pos == null) return null;

      const node = props.view.state.doc.nodeAt(pos);
      return node?.type === props.view.state.schema.nodes.table ? node : null;
    };

    // 上一次同步到 DOM 的列宽签名，避免每次输入都重写 colgroup。
    let widthSignature: string | null = null;

    const syncColumns = () => {
      const table = tableEl.value;
      const colgroup = colgroupEl.value;
      if (!table || !colgroup) return;

      // 拖拽过程中列宽由 columnResizing 直接写进 DOM 做实时预览，这里先让位。
      if (columnResizingPluginKey.getState(props.view.state)?.dragging) return;

      const node = getTableNode();
      if (!node) return;

      const row = node.firstChild;
      const signature = row
        ? Array.from({ length: row.childCount }, (_, index) => {
            const attrs = row.child(index).attrs;
            return `${attrs.colspan}:${attrs.colwidth ?? ''}`;
          }).join('|')
        : '';

      if (signature === widthSignature) return;
      widthSignature = signature;

      updateColumnsOnResize(node, colgroup, table, DEFAULT_CELL_MIN_WIDTH);
    };

    const syncState = () => {
      const pos = props.getPos();
      const node = getTableNode();

      if (pos == null || !node || !editor.editable.value) {
        state.value = null;
        colorVisible.value = false;
        textColorVisible.value = false;
        return;
      }

      const { from, to } = props.view.state.selection;
      const inTable = from >= pos && to <= pos + node.nodeSize;
      const next = inTable ? editor.getTableState() : null;

      if (!next) {
        colorVisible.value = false;
        textColorVisible.value = false;
      }
      if (!isSameTableState(next, state.value)) {
        state.value = next;
      }
    };

    // 编辑区滚动容器（view.dom 的父节点）顶部到表格顶部的距离放不下工具条时，
    // 翻到表格下方，避免盖住编辑器自己的工具条。
    const syncPlacement = () => {
      const table = tableEl.value;
      const scrollParent = editor.view.dom.parentElement;
      if (!table || !scrollParent) return;

      const height = toolbarRef.value?.offsetHeight ?? TOOLBAR_HEIGHT_FALLBACK;
      const spaceAbove =
        table.getBoundingClientRect().top - scrollParent.getBoundingClientRect().top;
      placement.value = spaceAbove < height + TOOLBAR_GAP ? 'bottom' : 'top';
    };

    /**
     * 在单元格里按下鼠标后，浏览器会一路按「原生选文字」的方式扩展 DOM 选区：
     * CellSelection 的 visible 是 false，prosemirror-tables 也只在 shift 拖拽时才
     * preventDefault，所以跨单元格框选时文字会被顺手一起选中。这里负责在选区变成「多个
     * 单元格」之后把它清掉并挡住后续的原生扩展，单个单元格内拖拽则完全不插手，保留原生的
     * 选文字能力。
     *
     * 抬手之后 ProseMirror 还会自己补写一次 DOM 选区（它给不可见选区挂
     * ProseMirror-hideselection，指望配套样式把它藏起来），那部分交给 editor.scss 里的
     * `&.ProseMirror-hideselection ::selection` 处理。
     */
    const cellFromEvent = (target: EventTarget | null): HTMLElement | null => {
      const el = target instanceof Element ? target : (target as Node | null)?.parentElement;
      const cell = el?.closest('td, th');
      return cell instanceof HTMLElement ? cell : null;
    };

    let dragOriginCell: HTMLElement | null = null;
    let disposed = false;

    const endCellDrag = () => {
      const escaped = draggingCells.value;
      dragOriginCell = null;

      window.removeEventListener('mousemove', onCellDragMove, true);
      window.removeEventListener('mouseup', endCellDrag, true);
      window.removeEventListener('dragstart', endCellDrag, true);

      if (!escaped) return;

      // 记下框选：一会儿可能要把它从浏览器的默认动作里救回来
      const cellSelection =
        props.view.state.selection instanceof CellSelection ? props.view.state.selection : null;

      // 抬手这一下浏览器还会按「按下点 → 抬起点」再补一次原生选区，只能等这轮事件走完再收尾。
      // 直接清空 DOM 选区会被 ProseMirror 的 DOM 观察者当成「用户改了选区」，框选会被降级成
      // 文本选区，所以清完顺手把框选再设一次，让它把这个（空的）DOM 选区认作当前状态。
      window.setTimeout(() => {
        if (disposed) return;

        draggingCells.value = false;
        window.getSelection()?.removeAllRanges();

        if (cellSelection) {
          const tr = props.view.state.tr.setSelection(cellSelection);
          tr.setMeta('addToHistory', false);
          props.view.dispatch(tr);
        }
      }, 0);
    };

    const onCellDragMove = (event: MouseEvent) => {
      if (!dragOriginCell) return;

      // 鼠标可能在窗口外面抬起，靠 buttons 兜底收尾
      if (!event.buttons) return endCellDrag();

      // 拖列宽时指针也会划过大片单元格，交给 columnResizing
      if (columnResizingPluginKey.getState(props.view.state)?.dragging) return endCellDrag();

      if (!draggingCells.value) {
        // 还在起始单元格里，这是普通的选文字，不插手
        if (cellFromEvent(event.target) === dragOriginCell) return;
        draggingCells.value = true;
      }

      // 已经拖出起始单元格：选区由 CellSelection 表达，丢掉浏览器选中的文字
      window.getSelection()?.removeAllRanges();
    };

    const onTableMousedown = (event: MouseEvent) => {
      // 右键/中键不参与，ctrl/meta（多选）、shift（扩选）、alt 也各有各的处理
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
        return;
      }

      dragOriginCell = cellFromEvent(event.target);
      if (!dragOriginCell) return;

      // 捕获阶段监听 mousemove，保证在原选区继续扩大之前就把它清掉
      window.addEventListener('mousemove', onCellDragMove, true);
      window.addEventListener('mouseup', endCellDrag, true);
      window.addEventListener('dragstart', endCellDrag, true);
    };

    watch(
      viewVersion,
      () => {
        syncState();
        syncColumns();
        syncPlacement();
      },
      { immediate: true },
    );

    // 工具条要渲染出来才知道真实高度，量到之后重新定一次上下位置
    watch(state, (next) => {
      if (next) nextTick(syncPlacement);
    });

    /**
     * 点击是不是落在「表格工具条这一套 UI」里：编辑器本体（正文 + 编辑器自己的工具条）、
     * 表格工具条的浮层，以及浮层里颜色选择器的那层浮层（后面两个都 teleport 到了 body 上）。
     * 捕获阶段监听全局 mousedown，点外面就把工具条收起来 —— 只靠选区变化判断不够，
     * 点编辑器外面不会产生事务，工具条会一直挂在那里。
     */
    const isInsideTableUi = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false;

      const editorRoot = props.view.dom.closest('.co-editor') ?? props.view.dom;
      if (editorRoot.contains(target)) return true;

      return !!target.closest(
        `.${bem.e('popper')}, .${bem.e('toolbar')}, .co-editor-picker, .co-editor-color-picker`,
      );
    };

    /** 点滚动条时事件 target 就是滚动容器、坐标落在内容区外面，这不算「点到编辑器外」 */
    const isScrollbarMousedown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return false;

      const scrollable =
        target.scrollHeight > target.clientHeight || target.scrollWidth > target.clientWidth;
      if (!scrollable) return false;

      const rect = target.getBoundingClientRect();
      return (
        event.clientX >= rect.left + target.clientWidth ||
        event.clientY >= rect.top + target.clientHeight
      );
    };

    const onDocumentMousedown = (event: MouseEvent) => {
      dismissed.value = !isInsideTableUi(event.target) && !isScrollbarMousedown(event);
    };

    onMounted(() => {
      syncColumns();
      // 捕获阶段监听：编辑区自身的滚动不冒泡到 window，滚完还要重新判断上下位置
      window.addEventListener('scroll', syncPlacement, true);
      window.addEventListener('resize', syncPlacement);
      document.addEventListener('mousedown', onDocumentMousedown, true);
    });

    onBeforeUnmount(() => {
      disposed = true;
      window.removeEventListener('scroll', syncPlacement, true);
      window.removeEventListener('resize', syncPlacement);
      document.removeEventListener('mousedown', onDocumentMousedown, true);
      endCellDrag();
    });

    const onVerticalAlign = (value: 'top' | 'middle' | 'bottom') => {
      editor.setCellVerticalAlign(state.value?.verticalAlign === value ? null : value);
    };

    const onToggleColor = () => {
      colorVisible.value = !colorVisible.value;
    };

    const onSelectColor = (color: string | null) => {
      editor.setCellBackground(color);
      colorVisible.value = false;
    };

    const onToggleTextColor = () => {
      textColorVisible.value = !textColorVisible.value;
    };

    const onSelectTextColor = (color: string | null) => {
      editor.setCellColor(color);
      textColorVisible.value = false;
    };

    return () => {
      const tableState = state.value;

      return (
        <>
          <div
            ref={setWrapper}
            class={[
              bem.b(),
              bem.is('active', props.selected),
              bem.is('cell-dragging', draggingCells.value),
            ]}
            onMousedown={onTableMousedown}
          >
            <table ref={setTable}>
              <colgroup ref={setColgroup}></colgroup>
              <tbody ref={(el) => props.registerContent(el as HTMLElement | null)}></tbody>
            </table>
          </div>

          {tableEl.value && tableState && !dismissed.value && (
            <ElPopover
              virtual-ref={tableEl.value}
              virtual-triggering={true}
              visible={true}
              trigger="click"
              placement={placement.value}
              show-arrow={true}
              width="auto"
              popperClass={bem.e('popper')}
            >
              {{
                default: () => (
                  <div ref="tableToolbar" class={bem.e('toolbar')}>
                    <ButtonGroupList>
                      <ButtonGroup duo>
                        <Button title="上移行" onClick={() => editor.moveRowUp()}>
                          <Icon>
                            <RtiRowMoveUp />
                          </Icon>
                        </Button>
                        <Button title="上方插入行" onClick={() => editor.insertRowAbove()}>
                          <Icon>
                            <RtiRowInsertAbove />
                          </Icon>
                        </Button>
                        <Button title="下移行" onClick={() => editor.moveRowDown()}>
                          <Icon>
                            <RtiRowMoveDown />
                          </Icon>
                        </Button>
                        <Button title="下方插入行" onClick={() => editor.insertRowBelow()}>
                          <Icon>
                            <RtiRowInsert />
                          </Icon>
                        </Button>
                        <Button title="左移列" onClick={() => editor.moveColumnLeft()}>
                          <Icon>
                            <RtiColumnMoveLeft />
                          </Icon>
                        </Button>
                        <Button title="左侧插入列" onClick={() => editor.insertColumnLeft()}>
                          <Icon>
                            <RtiColumnInsertLeft />
                          </Icon>
                        </Button>
                        <Button title="右移列" onClick={() => editor.moveColumnRight()}>
                          <Icon>
                            <RtiColumnMoveRight />
                          </Icon>
                        </Button>
                        <Button title="右侧插入列" onClick={() => editor.insertColumnRight()}>
                          <Icon>
                            <RtiColumnInsert />
                          </Icon>
                        </Button>
                      </ButtonGroup>

                      <ButtonGroup duo>
                        <Button
                          title="顶端对齐"
                          active={tableState.verticalAlign === 'top'}
                          onClick={() => onVerticalAlign('top')}
                        >
                          <RtiAlignTop />
                        </Button>
                        <Button
                          title="选中行设为标题行"
                          active={tableState.headerRow}
                          onClick={() => editor.toggleHeaderRow()}
                        >
                          <RtiRowHeader />
                        </Button>
                        <Button
                          title="垂直居中"
                          active={tableState.verticalAlign === 'middle'}
                          onClick={() => onVerticalAlign('middle')}
                        >
                          <RtiAlignCenterVertical />
                        </Button>
                        <Button
                          title="选中列设为标题列"
                          active={tableState.headerColumn}
                          onClick={() => editor.toggleHeaderColumn()}
                        >
                          <RtiColumnHeader />
                        </Button>
                        <Button
                          title="底端对齐"
                          active={tableState.verticalAlign === 'bottom'}
                          onClick={() => onVerticalAlign('bottom')}
                        >
                          <RtiAlignBottom />
                        </Button>
                        <Button
                          title="当前单元格设为标题单元格"
                          active={tableState.headerCell}
                          onClick={() => editor.toggleHeaderCell()}
                        >
                          <RtiCellHeader />
                        </Button>
                      </ButtonGroup>

                      <ButtonGroup duo>
                        <Button title="合并单元格" onClick={() => editor.mergeCells()}>
                          <RtiMergeCells />
                        </Button>
                        <ColorPicker
                          v-model:visible={colorVisible.value}
                          onSelect={(color: string) => onSelectColor(color)}
                          onClear={() => onSelectColor(null)}
                        >
                          <Button
                            title="单元格底色"
                            active={colorVisible.value}
                            pickerTrigger
                            onClick={onToggleColor}
                          >
                            <RtiCellBackground />
                          </Button>
                        </ColorPicker>
                        <Button title="拆分单元格" onClick={() => editor.splitCell()}>
                          <RtiSplitCells />
                        </Button>
                        <ColorPicker
                          v-model:visible={textColorVisible.value}
                          onSelect={(color: string) => onSelectTextColor(color)}
                          onClear={() => onSelectTextColor(null)}
                        >
                          <Button
                            title="单元格文字颜色"
                            active={textColorVisible.value}
                            pickerTrigger
                            onClick={onToggleTextColor}
                          >
                            <RtiCellTextColor />
                          </Button>
                        </ColorPicker>
                      </ButtonGroup>

                      <ButtonGroup duo>
                        <Button title="删除行" onClick={() => editor.deleteRow()}>
                          <Icon>
                            <RtiRowDelete />
                          </Icon>
                        </Button>
                        <div></div>
                        <Button title="删除列" onClick={() => editor.deleteColumn()}>
                          <Icon>
                            <RtiColumnDelete />
                          </Icon>
                        </Button>
                        <Button title="删除表格" onClick={() => editor.deleteTable()}>
                          <Icon>
                            <RtiTableDelete />
                          </Icon>
                        </Button>
                      </ButtonGroup>
                    </ButtonGroupList>
                  </div>
                ),
              }}
            </ElPopover>
          )}
        </>
      );
    };
  },
});
