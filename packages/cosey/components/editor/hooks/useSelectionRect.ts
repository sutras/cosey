import { onBeforeUnmount, ref, watch, type Ref } from 'vue';
import { useEditor } from '../pm/context';
import { viewVersion } from '../pm/reactive-view';

export interface SelectionRect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * 选中文本的 DOM 边界矩形（视口坐标）。没有选中文本时返回 null。
 *
 * 只认「落在本编辑器里的、非折叠的原生选区」——光标切去了别的编辑器或页面其他输入框时，
 * ProseMirror 自己的 state.selection 仍是旧的，不能拿它当展示依据。
 *
 * 拖选期间（鼠标按下到松开）不更新矩形：浮动工具条应等用户松开鼠标、选区定型后再浮出，
 * 避免一边拖选一边跟着移动。因此内部用一个 `dragging` 标记抑制「鼠标按下→松开」之间的
 * selectionchange / 事务更新，`mouseup` 时再补一次测量。
 *
 * 焦点进入「编辑器子树上的子弹窗」（如链接/图片/表格弹窗）时同样冻结：这些弹窗挂在
 * 工具条组件子树上，此刻把矩形置空会导致工具条连同弹窗一起被卸载，弹窗表现为「一碰就没」。
 *
 * 但「编辑器本身就被装在一个弹窗里」（如 co-form-dialog 内嵌编辑器）是正常场景，绝不能冻结：
 * 此时 document.activeElement 也在 .el-dialog/.el-overlay 内，若不加区分地冻结，浮动工具条
 * 和块级菜单就永远出不来。区分依据——命中的弹窗是否包含编辑器 DOM（view.dom）：
 * 包含 → 编辑器的外层容器，正常测量；不包含 → 子弹窗，冻结。
 */
export function useSelectionRect(): Ref<SelectionRect | null> {
  const editor = useEditor();
  const rect = ref<SelectionRect | null>(null);

  // 鼠标按下（拖选开始）置 true，松开置 false；只有非拖选状态下才允许测量
  const dragging = ref(false);

  const isFocusInDialog = () => {
    const active = document.activeElement;
    const dialog = active?.closest<HTMLElement>('.el-dialog, .el-overlay');
    if (!dialog) return false;
    // 弹窗里装的就是本编辑器（view.dom 是弹窗的后代）→ 正常编辑上下文，不冻结；
    // 否则是编辑器子树上的子弹窗（链接/图片等），冻结以保护工具条不随弹窗卸载。
    return !dialog.contains(editor.view.dom);
  };

  const measure = () => {
    if (dragging.value || isFocusInDialog()) return;

    const { state, view } = editor;

    const domSelection = window.getSelection();
    const domSelected =
      !!domSelection &&
      !domSelection.isCollapsed &&
      domSelection.rangeCount > 0 &&
      !!domSelection.anchorNode &&
      view.dom.contains(domSelection.anchorNode);

    if (state.selection.empty || !domSelected) {
      rect.value = null;
      return;
    }

    const domRect = domSelection!.getRangeAt(0).getBoundingClientRect();
    if (!domRect || (domRect.width === 0 && domRect.height === 0)) {
      // 折叠到零尺寸的选区（如跨节点视图的框选）没有可附着的位置
      rect.value = null;
      return;
    }

    rect.value = {
      top: domRect.top,
      bottom: domRect.bottom,
      left: domRect.left,
      right: domRect.right,
    };
  };

  const onMouseDown = () => {
    dragging.value = true;
  };

  const onMouseUp = () => {
    dragging.value = false;
    // 松开鼠标时选区已定型，立即测量一次让工具条浮出
    measure();
  };

  watch(viewVersion, measure, { immediate: true });

  // 选区可能被拖拽改变但未产生事务（例如双击选词），补一次 selectionchange
  if (typeof document !== 'undefined') {
    document.addEventListener('selectionchange', measure, false);
    document.addEventListener('mousedown', onMouseDown, true);
    document.addEventListener('mouseup', onMouseUp, true);
    // 选区矩形是「视口坐标」，任何滚动（页面滚动、编辑器内部滚动容器）都会让它失效，
    // 浮动工具条若不重新测量就会停在原地、不随选区滚动。用捕获阶段监听，这样即使
    // 滚动目标上的处理函数 stopPropagation 也能收到。
    document.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
  }

  onBeforeUnmount(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('selectionchange', measure, false);
      document.removeEventListener('mousedown', onMouseDown, true);
      document.removeEventListener('mouseup', onMouseUp, true);
      document.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
    }
  });

  return rect;
}
