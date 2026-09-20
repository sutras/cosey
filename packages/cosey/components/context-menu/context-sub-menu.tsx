import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  Teleport,
  Transition,
  useTemplateRef,
  watch,
} from 'vue';
import { useZIndex } from 'element-plus';
import { flip, offset, shift } from '@floating-ui/dom';
import { contextSubMenuProps, contextSubMenuSlots } from './context-sub-menu.api';
import { useFloating } from '../../hooks';
import Content from './content';
import Divider from './divider';
import { useItemInject, useItemProvide } from './useItemProvide';
import { useSubInject, useSubProvide } from './useSubProvide';
import { createBem } from '../../utils';

export default defineComponent({
  name: 'CoContextSubMenu',
  inheritAttrs: false,
  props: contextSubMenuProps,
  slots: contextSubMenuSlots,
  setup(props, { attrs, slots }) {
    const bem = createBem('context-menu');

    const itemRef = useTemplateRef<HTMLElement>('item');
    const subRef = useTemplateRef<HTMLElement>('sub');

    // sub provide
    useSubProvide();

    const { addItem, removeItem, select, enter, leave, withIcon } = useItemInject();

    const itemInstance = reactive({
      icon: computed(() => !!props.icon || !!slots.icon),
      hide: () => {
        hide();
      },
    });

    onMounted(() => {
      addItem(itemInstance);
    });

    onBeforeUnmount(() => {
      removeItem(itemInstance);
    });

    // floating
    const { x, y, floating } = useFloating(itemRef, subRef, {
      placement: 'right-start',
      strategy: 'fixed',
      middleware: [offset(-5), flip(), shift({ padding: 5 })],
    });

    const { nextZIndex } = useZIndex();

    const zIndex = ref(0);

    const subStyle = computed(() => {
      return {
        insetBlockStart: `${y.value}px`,
        insetInlineStart: `${x.value}px`,
        zIndex: zIndex.value,
      };
    });

    // hover status
    const hoverStatus = ref<'left' | 'leaving' | 'entering' | 'entered'>('left');

    const onEnter = () => {
      if (props.disabled) {
        return;
      }
      if (hoverStatus.value === 'left') {
        hoverStatus.value = 'entering';
      } else if (hoverStatus.value === 'leaving') {
        hoverStatus.value = 'entered';
      }
      enter(itemInstance);
    };

    const keepEntered = true;

    const onLeave = () => {
      if (hoverStatus.value === 'entering') {
        hoverStatus.value = 'left';
      }

      if (!keepEntered) {
        if (hoverStatus.value === 'entered') {
          hoverStatus.value = 'leaving';
        }

        leave();
      }
    };

    const onClick = () => {
      if (props.disabled) {
        return;
      }
      hoverStatus.value = 'entered';
    };

    const show = () => {
      hoverStatus.value = 'entered';
    };

    const hide = () => {
      hoverStatus.value = 'left';
    };

    const visible = computed(() => {
      return hoverStatus.value === 'entered' || hoverStatus.value === 'leaving';
    });

    watch(visible, (visible) => {
      floating.value = visible;

      if (visible) {
        zIndex.value = nextZIndex();
      }
    });

    const { addSub, removeSub, showSub, hideSub, persistent } = useSubInject();

    const subInstance = reactive({
      show,
      hide,
    });

    onMounted(() => {
      addSub(subInstance);
    });

    onBeforeUnmount(() => {
      removeSub(subInstance);
    });

    let timer: ReturnType<typeof setTimeout> | null = null;

    const clear = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    onBeforeUnmount(() => {
      clear();
    });

    watch(hoverStatus, (value) => {
      clear();
      switch (value) {
        case 'entering':
          timer = setTimeout(() => {
            timer = null;
            hoverStatus.value = 'entered';
          }, 200);
          break;
        case 'leaving':
          timer = setTimeout(() => {
            timer = null;
            hoverStatus.value = 'left';
          }, 200);
          break;
        case 'entered':
          showSub(subInstance);
          break;
        case 'left':
          hideSub(subInstance);
          break;
      }
    });

    // item provide
    useItemProvide({
      onSelect(command) {
        select(command);
      },
      onEnter,
      onLeave,
    });

    return () => {
      return (
        <>
          {props.divided && <Divider />}
          <div
            ref="item"
            {...attrs}
            onClick={onClick}
            onPointerenter={onEnter}
            onPointerleave={onLeave}
          >
            <Content
              icon={props.icon}
              with-icon={withIcon.value}
              title={props.title}
              hover={visible.value}
              arrow
              disabled={props.disabled}
              v-slots={slots.icon ? { icon: () => slots.icon!({}) } : undefined}
            />
          </div>

          {persistent ? (
            <Teleport to="body">
              <div
                ref="sub"
                v-show={visible.value}
                class={bem.b()}
                style={subStyle.value}
                onPointerenter={onEnter}
                onPointerleave={onLeave}
              >
                {slots.default?.({})}
              </div>
            </Teleport>
          ) : (
            <Transition name="co-fade-out">
              {visible.value && (
                <Teleport to="body">
                  <div
                    ref="sub"
                    class={bem.b()}
                    style={subStyle.value}
                    onPointerenter={onEnter}
                    onPointerleave={onLeave}
                  >
                    {slots.default?.({})}
                  </div>
                </Teleport>
              )}
            </Transition>
          )}
        </>
      );
    };
  },
});
