import { onBeforeUnmount, ref, watch, type Ref } from 'vue';
import { type Node as PMNode } from 'prosemirror-model';
import { NodeSelection } from 'prosemirror-state';
import { useEditor } from '../pm/context';
import { viewVersion } from '../pm/reactive-view';

export interface BlockRect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * 当前光标/选区所在的「顶层块级元素」（doc 直下的段落/标题/列表/引用/代码块/表格）
 * 的 DOM 边界矩形（视口坐标）。块级菜单入口按钮就贴在它左侧。
 *
 * 焦点进入「编辑器子树上的子弹窗」（块级菜单上的插入类弹窗）时冻结测量：此刻把矩形
 * 置空会把块级菜单连同它子树上的弹窗一起卸载。
 *
 * 但「编辑器本身就被装在一个弹窗里」（如 co-form-dialog 内嵌编辑器）是正常场景，绝不能冻结：
 * 此时 document.activeElement 也在 .el-dialog/.el-overlay 内。区分依据——命中的弹窗是否包含
 * 编辑器 DOM（view.dom）：包含 → 编辑器的外层容器，正常测量；不包含 → 子弹窗，冻结。
 */
export function useBlockRect(): Ref<BlockRect | null> {
  const editor = useEditor();
  const rect = ref<BlockRect | null>(null);

  const measure = () => {
    const active = document.activeElement;
    const dialog = active?.closest<HTMLElement>('.el-dialog, .el-overlay');
    if (dialog && !dialog.contains(editor.view.dom)) return;

    const { state, view } = editor;
    const { selection } = state;

    // 光标所在的顶层块：depth 1 上的节点。整节点选中的原子节点（表格）$from 在 depth 0，
    // 这时直接取选中的节点本身。
    let pos: number;
    let node: PMNode | null;

    if (selection instanceof NodeSelection) {
      node = selection.node;
      pos = selection.from;
    } else {
      const { $from } = selection;
      if ($from.depth < 1) {
        // 全选（AllSelection）时 $from 落在 doc 顶层（depth 0），before(1) 无法定位。
        // 此时锚定文档第一个块节点（pos 0），保证入口按钮在全选后仍可见，
        // 便于对整篇内容做「改为段落/标题」等块级操作。
        const firstChild = state.doc.firstChild;
        if (firstChild && firstChild.isBlock) {
          node = firstChild;
          pos = 0;
        } else {
          rect.value = null;
          return;
        }
      } else {
        pos = $from.before(1);
        node = state.doc.nodeAt(pos);
      }
    }

    if (!node || !node.isBlock) {
      rect.value = null;
      return;
    }

    // domAtPos 在块起点只会给出父容器，nodeDOM 才是块节点自己的 DOM
    const el = view.nodeDOM(pos);
    if (!(el instanceof HTMLElement)) {
      rect.value = null;
      return;
    }

    const domRect = el.getBoundingClientRect();
    if (!domRect || (domRect.width === 0 && domRect.height === 0)) {
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

  watch(viewVersion, measure, { immediate: true });

  if (typeof document !== 'undefined') {
    document.addEventListener('selectionchange', measure, false);
    // 块级元素是「视口坐标」的矩形，任何滚动（页面滚动、编辑器内部滚动容器）
    // 都会让矩形失效，入口按钮/菜单若不重新测量就会停在原地。用捕获阶段监听，
    // 这样即使滚动目标上的处理函数 stopPropagation 也能收到。
    document.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
  }

  onBeforeUnmount(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('selectionchange', measure, false);
      document.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
    }
  });

  return rect;
}
