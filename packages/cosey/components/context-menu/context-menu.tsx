import { computed, defineComponent, ref, Teleport, Transition, useTemplateRef, watch } from 'vue';
import { flip, offset, shift } from '@floating-ui/dom';
import { useZIndex } from 'element-plus';
import {
  contextMenuProps,
  contextMenuSlots,
  contextMenuEmits,
  type ContextMenuExpose,
  type ContextMenuVirtualRef,
} from './context-menu.api';
import { useItemProvide } from './useItemProvide';
import { useSubProvide } from './useSubProvide';
import { useFloating, useLockScroll } from '../../hooks';
import { OnlyChild } from '../only-child';
import { createBem } from '../../utils';

export default defineComponent({
  name: 'CoContextMenu',
  inheritAttrs: false,
  props: contextMenuProps,
  slots: contextMenuSlots,
  emits: contextMenuEmits,
  setup(props, { slots, attrs, emit, expose }) {
    const bem = createBem('context-menu');

    const { nextZIndex } = useZIndex();

    const zIndex = ref(0);

    const pointX = ref(0);
    const pointY = ref(0);

    const pointRef = useTemplateRef<HTMLElement>('point');
    const menuRef = useTemplateRef<HTMLElement>('menu');

    // 外部虚拟引用（锚点定位）：用它的 getBoundingClientRect 计算锚点坐标
    const virtualRef = ref<ContextMenuVirtualRef | null>(props.virtualRef);

    watch(
      () => props.virtualRef,
      (value) => {
        virtualRef.value = value;
      },
    );

    // 定位 reference：锚点模式直接用虚拟引用（virtual element，每次定位取实时坐标，
    // 滚动时外部更新锚点即可跟随）；坐标模式（右键/点击）用零尺寸的 point div。
    const referenceEl = computed(() => virtualRef.value ?? pointRef.value);

    const visible = ref(false);

    // lockScroll=false 时不锁页面滚动（避免 body 宽度补偿引发的布局跳变，
    // 见 context-menu.api.ts 里 lockScroll 的注释）
    useLockScroll(computed(() => visible.value && props.lockScroll));

    const {
      x,
      y,
      floating,
      update: syncPosition,
    } = useFloating(referenceEl, menuRef, {
      placement: props.placement,
      strategy: 'fixed',
      middleware: [offset(props.offset), flip(), shift({ padding: 5 })],
    });

    watch(visible, (visible) => {
      floating.value = visible;
    });

    const pointStyle = computed(() => {
      return {
        insetInlineStart: `${pointX.value}px`,
        insetBlockStart: `${pointY.value}px`,
        zIndex: zIndex.value,
      };
    });

    const backdropStyle = computed(() => {
      return {
        zIndex: zIndex.value,
      };
    });

    const menuStyle = computed(() => {
      return {
        insetInlineStart: `${x.value}px`,
        insetBlockStart: `${y.value}px`,
        zIndex: zIndex.value,
      };
    });

    const open = (x?: number, y?: number) => {
      if (x !== undefined && y !== undefined) {
        // 坐标模式：point div 移到指定坐标（锚点模式下 point div 不参与定位）
        pointX.value = x;
        pointY.value = y;
      }
      // 锚点模式无需写坐标：定位时实时读取 virtualRef 的 getBoundingClientRect

      if (!visible.value) {
        zIndex.value = nextZIndex();
        visible.value = true;
      } else {
        // persistent 菜单重复打开时 reference 可能已变化（如锚点移动），
        // 手动同步一次坐标（useFloating 的 autoUpdate 重建只在 reference 引用变化时触发）
        syncPosition();
      }

      emit('open');
    };

    const close = () => {
      visible.value = false;
      // persistent 模式下子菜单浮层独立渲染在 body 上，收起菜单时需要显式级联收起
      hideAllSubs();

      emit('close');
    };

    const onBackDropClick = () => {
      close();
    };

    const onBackdropContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      close();
    };

    const onContextMenu = (event: MouseEvent) => {
      if (props.disabled) {
        return;
      }
      if (props.trigger !== 'contextmenu') {
        return;
      }
      event.preventDefault();
      open(event.clientX, event.clientY);
    };

    const onClick = (event: MouseEvent) => {
      if (props.disabled) {
        return;
      }
      if (props.trigger !== 'click') {
        return;
      }
      event.preventDefault();
      open(event.clientX, event.clientY);
    };

    const onMenuContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    // item provide
    useItemProvide({
      onSelect(command) {
        if (visible.value) {
          emit('command', command);
          close();
        }
      },
    });

    // sub provide
    const { hideAll: hideAllSubs } = useSubProvide({ persistent: props.persistent });

    expose<ContextMenuExpose>({
      open,
      close,
    });

    return () => {
      const menuTree = (
        <div v-show={visible.value}>
          <div ref="point" class={bem.e('point')} style={pointStyle.value}></div>
          <div
            v-show={visible.value}
            class={bem.e('mask')}
            style={backdropStyle.value}
            onClick={onBackDropClick}
            onContextmenu={onBackdropContextMenu}
          ></div>
          <div
            ref="menu"
            v-show={visible.value}
            {...attrs}
            class={bem.b()}
            style={menuStyle.value}
            onContextmenu={onMenuContextMenu}
          >
            {slots.default?.({})}
          </div>
        </div>
      );

      return (
        <>
          {slots.reference && (
            <OnlyChild {...{ onContextmenu: onContextMenu, onClick }}>
              {slots.reference({})}
            </OnlyChild>
          )}

          <Teleport to="body">
            {props.persistent ? (
              menuTree
            ) : (
              <Transition name="co-fade-out">{visible.value ? menuTree : null}</Transition>
            )}
          </Teleport>
        </>
      );
    };
  },
});
