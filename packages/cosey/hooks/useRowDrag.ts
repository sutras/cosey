import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue';

export interface UseRowDragOptions {
  /** 是否启用；关闭时不会绑定任何行为 */
  enabled: () => boolean;
  /** 表格根元素 */
  rootRef: Ref<HTMLElement | null>;
  /** 移动回调：从 from 拖到 to（`to` 是移动结束后的最终下标） */
  onMove: (from: number, to: number) => void;
  /**
   * 拖拽手柄的选择器：只有在这个元素上按下才会进入拖拽。
   *
   * 行内常常有输入框 / 按钮 / 可选中文字，所以不支持整行可拖。
   * 手柄自身需要声明 `cursor` 与 `touch-action: none`。
   */
  handle: string;
  /** 按下后移动多少像素才真正进入拖拽，低于阈值当点击处理 */
  threshold?: number;
}

const ROW_SELECTOR = 'tr.el-table__row';
const DRAGGING_CLASS = 'is-dragging';
/** 落点在参照行的上方：高亮线画在行的上边框 */
const OVER_BEFORE_CLASS = 'is-drag-over';
/** 落点在参照行的下方：高亮线画在行的下边框 */
const OVER_AFTER_CLASS = 'is-drag-over-after';
const DEFAULT_THRESHOLD = 4;

interface DropTarget {
  /** 参照行在 DOM 中的下标 */
  index: number;
  /** true 表示插到该行之后，false 表示插到该行之前 */
  after: boolean;
}

/**
 * 表格行拖拽。
 *
 * 用 pointer 事件而不是 HTML5 拖放：`draggable` 的拖拽源一旦离开元素，浏览器就会
 * 中断整次拖拽（尤其只会拖一个 16px 的手柄时），鼠标还会变成禁止光标。pointer 方案
 * 把监听挂在 document 上，指针跑到哪里都不会断，顺带能用在触屏上。
 */
export function useRowDrag(options: UseRowDragOptions) {
  /** 正在拖的行下标；-1 表示没在拖 */
  let fromIndex = -1;
  /** 按下时的指针 id，用来忽略其它手指 / 其它指针 */
  let pointerId: number | null = null;
  let startY = 0;
  let started = false;
  let rowEl: HTMLElement | null = null;
  /** 按下时命中的元素，用来做指针捕获 */
  let captureEl: Element | null = null;
  let dropTarget: DropTarget | null = null;
  let bound = false;

  const getRoot = () => options.rootRef.value;

  const getRows = () => {
    const root = getRoot();
    return root ? Array.from(root.querySelectorAll<HTMLElement>(ROW_SELECTOR)) : [];
  };

  /**
   * 求出落点。以行的中线为界：上半部分 → 插到该行之前，下半部分 → 插到该行之后。
   *
   * 注意 `after` 不能省。只返回一个下标时，最后一行的下半部分没有「下一行」可以承载
   * 那条上边框高亮线，线会落在倒数第二行和最后一行之间，而真实落点却在末尾 ——
   * 差出去一格，就是「看着放上面、实际放下面」。
   */
  const getDropTarget = (event: { clientY: number }): DropTarget | null => {
    const rows = getRows();

    if (!rows.length) {
      return null;
    }

    for (let i = 0; i < rows.length; i++) {
      const rect = rows[i].getBoundingClientRect();

      if (event.clientY < rect.top + rect.height / 2) {
        return { index: i, after: false };
      }
    }

    return { index: rows.length - 1, after: true };
  };

  /**
   * 把「插到第 p 行之前」翻译成「这一行移动后的最终下标」。
   *
   * `onMove(from, to)` 的 `to` 是移动结束后的位置（arrayMove 语义），所以当插入点
   * 在 from 之后时要减 1 —— 被拖走的那一行自己会从数组里消失。
   */
  const toTargetIndex = (target: DropTarget, from: number) => {
    const insertIndex = target.index + (target.after ? 1 : 0);

    return insertIndex > from ? insertIndex - 1 : insertIndex;
  };

  const paintDropTarget = (target: DropTarget | null) => {
    // 插到自己上面 / 自己下面都等于没动，不画线，免得暗示一个不存在的落点
    const activeIndex =
      target && toTargetIndex(target, fromIndex) !== fromIndex ? target.index : -1;
    const after = !!target?.after;

    getRows().forEach((row, i) => {
      const active = i === activeIndex;
      row.classList.toggle(OVER_BEFORE_CLASS, active && !after);
      row.classList.toggle(OVER_AFTER_CLASS, active && after);
    });
  };

  function stop() {
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    document.removeEventListener('pointercancel', onPointerUp);
    window.removeEventListener('blur', cleanup);
  }

  function cleanup() {
    stop();

    if (captureEl && pointerId !== null) {
      try {
        if (captureEl.hasPointerCapture?.(pointerId)) {
          captureEl.releasePointerCapture(pointerId);
        }
      } catch {
        // 元素可能已经被卸载，忽略
      }
    }

    getRows().forEach((row) =>
      row.classList.remove(DRAGGING_CLASS, OVER_BEFORE_CLASS, OVER_AFTER_CLASS),
    );

    fromIndex = -1;
    pointerId = null;
    started = false;
    rowEl = null;
    captureEl = null;
    dropTarget = null;
  }

  function onPointerMove(event: PointerEvent) {
    if (fromIndex < 0 || event.pointerId !== pointerId) {
      return;
    }

    if (!started) {
      if (Math.abs(event.clientY - startY) < (options.threshold ?? DEFAULT_THRESHOLD)) {
        return;
      }

      started = true;
      rowEl?.classList.add(DRAGGING_CLASS);
      // 启动前可能已经选中了一点文本，收回来
      window.getSelection()?.removeAllRanges();
    }

    event.preventDefault();

    dropTarget = getDropTarget(event);
    paintDropTarget(dropTarget);
  }

  function onPointerUp(event: PointerEvent) {
    if (fromIndex < 0 || event.pointerId !== pointerId) {
      return;
    }

    const from = fromIndex;
    const to = started && dropTarget ? toTargetIndex(dropTarget, from) : -1;

    cleanup();

    if (to >= 0 && to !== from) {
      options.onMove(from, to);
    }
  }

  const onPointerDown = (event: PointerEvent) => {
    if (!options.enabled() || event.button !== 0 || fromIndex >= 0) {
      return;
    }

    const target = event.target as HTMLElement | null;

    if (!target) {
      return;
    }

    if (!target.closest(options.handle)) {
      return;
    }

    const row = target.closest<HTMLElement>(ROW_SELECTOR);

    if (!row) {
      return;
    }

    fromIndex = getRows().indexOf(row);

    if (fromIndex < 0) {
      return;
    }

    pointerId = event.pointerId;
    startY = event.clientY;
    rowEl = row;
    started = false;
    dropTarget = null;
    // 优先捕获手柄本身：图标 svg 可能在拖拽中被替换，捕获会跟着丢
    captureEl = (options.handle && target.closest(options.handle)) || target;

    try {
      // 捕获之后指针跑到窗口外也照样收 move / up；Chromium 在捕获期间保持该元素的光标，
      // 不会因为指针掠过别的元素而变回 pointer / text
      captureEl.setPointerCapture(event.pointerId);
    } catch {
      captureEl = null;
    }

    // 这里**不** preventDefault：还没超过阈值，点击 / 聚焦都得照常发生
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerUp);
    // 切走窗口时收不到 pointerup，直接当作取消，别把拖拽态和 body 锁留在页面上
    window.addEventListener('blur', cleanup);
  };

  const bind = () => {
    const root = getRoot();

    if (!root || bound) {
      return;
    }

    root.addEventListener('pointerdown', onPointerDown);

    bound = true;
  };

  const unbind = () => {
    const root = getRoot();

    if (root) {
      root.removeEventListener('pointerdown', onPointerDown);
    }

    bound = false;
    cleanup();
  };

  onMounted(() => {
    if (options.enabled()) {
      bind();
    }
  });

  watch(
    options.enabled,
    (value) => {
      if (value) {
        bind();
      } else {
        unbind();
      }
    },
    // post：等 DOM 落位再绑。运行中把布局切成 table 时，pre 阶段 rootRef 还是 null，
    // 会静默绑不上
    { flush: 'post' },
  );

  onBeforeUnmount(unbind);
}
