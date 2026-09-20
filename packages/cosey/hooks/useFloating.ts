import { autoUpdate, computePosition, type ComputePositionConfig } from '@floating-ui/dom';
import { onBeforeUnmount, ref, Ref, watch } from 'vue';

/** 虚拟引用元素：无需真实 DOM，只需提供实时坐标（每次调用返回当前视口位置）。 */
export interface FloatingVirtualElement {
  getBoundingClientRect: () => DOMRect;
}

/**
 * 以组合式函数的方式对 @floating-ui/dom 进行包装，简化使用。
 *
 * reference 既可以是真实 DOM，也可以是虚拟引用元素（只有 getBoundingClientRect）；
 * 虚拟引用每次定位都会取实时坐标，配合外部在滚动时重建引用，可让浮层跟随滚动。
 */
export function useFloating(
  referenceEl: Ref<HTMLElement | FloatingVirtualElement | null>,
  floatingEl: Ref<HTMLElement | null>,
  options?: Partial<ComputePositionConfig>,
) {
  const x = ref(0);
  const y = ref(0);
  const floating = ref(false);

  let cleanup: (() => void) | null = null;

  function updatePosition() {
    if (referenceEl.value && floatingEl.value) {
      computePosition(referenceEl.value, floatingEl.value, {
        ...options,
      }).then((position) => {
        x.value = position.x;
        y.value = position.y;
      });
    }
  }

  watch(
    [referenceEl, floatingEl, floating],
    ([referenceEl, floatingEl, floating]) => {
      if (referenceEl && floatingEl && floating) {
        cleanup = autoUpdate(referenceEl, floatingEl, updatePosition);
      } else if (cleanup) {
        cleanup();
        cleanup = null;
      }
    },
    {
      immediate: true,
    },
  );

  onBeforeUnmount(() => {
    floating.value = false;
  });

  return {
    x,
    y,
    floating,
    /** 手动触发一次重定位（autoUpdate 之外的补充手段）。 */
    update: updatePosition,
  };
}
