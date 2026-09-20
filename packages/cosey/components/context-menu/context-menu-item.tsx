import { computed, defineComponent, onBeforeUnmount, onMounted, reactive } from 'vue';
import {
  contextMenuItemEmits,
  contextMenuItemProps,
  contextMenuItemSlots,
} from './context-menu-item.api';
import Content from './content';
import Divider from './divider';
import { useItemInject } from './useItemProvide';

export default defineComponent({
  name: 'CoContextMenuItem',
  inheritAttrs: false,
  props: contextMenuItemProps,
  slots: contextMenuItemSlots,
  emits: contextMenuItemEmits,
  setup(props, { attrs, emit, slots }) {
    // iten inject
    const { addItem, removeItem, select, enter, leave, withIcon } = useItemInject();

    const itemInstance = reactive({
      icon: computed(() => !!props.icon || !!slots.icon),
    });

    onMounted(() => {
      addItem(itemInstance);
    });

    onBeforeUnmount(() => {
      removeItem(itemInstance);
    });

    const onClick = (event: MouseEvent) => {
      if (props.disabled) {
        return;
      }
      emit('click', event);
      if (props.closeOnSelect) {
        select(props.command);
      }
    };

    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      if (props.disabled) {
        return;
      }
      if (props.closeOnSelect) {
        select(props.command);
      }
    };

    const onEnter = () => {
      enter(itemInstance);
    };

    const onLeave = () => {
      leave();
    };

    return () => {
      // 仅在真正传入 default 插槽时才传 children：
      // JSX 中无条件传 children 会让 Content 的 slots.default 恒存在，
      // 导致 title 文字被空的内容分支顶掉。
      // slots 一律用 v-slots 传递：普通对象 children 会被当作默认插槽的返回值
      const contentProps = {
        icon: props.icon,
        withIcon: withIcon.value,
        title: props.title,
        disabled: props.disabled,
        active: props.active,
        onClick,
        onContextmenu: onContextMenu,
        onPointerenter: onEnter,
        onPointerleave: onLeave,
      } as const;

      const contentVNode = slots.default ? (
        <Content
          {...attrs}
          {...contentProps}
          v-slots={{
            default: () => slots.default!({}),
            ...(slots.icon ? { icon: () => slots.icon!({}) } : null),
          }}
        />
      ) : (
        <Content
          {...attrs}
          {...contentProps}
          v-slots={slots.icon ? { icon: () => slots.icon!({}) } : undefined}
        />
      );

      return (
        <>
          {props.divided && <Divider />}
          {contentVNode}
        </>
      );
    };
  },
});
