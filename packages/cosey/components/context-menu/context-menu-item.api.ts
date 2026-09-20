import { type Component, type ExtractPropTypes, type PropType, type SlotsType } from 'vue';

export const contextMenuItemProps = {
  command: {},
  disabled: {
    type: Boolean,
  },
  divided: {
    type: Boolean,
  },
  icon: {
    /** 图标组件，或图标名（如 `co:user`） */
    type: [String, Object, Function] as PropType<string | Component>,
  },
  title: {
    type: String,
  },
  /**
   * 点击后是否关闭整个菜单。默认 `true`。
   * 当菜单项内嵌了需要继续交互的浮层（如下拉、网格选择器）时设为 `false`。
   */
  closeOnSelect: {
    type: Boolean,
    default: true,
  },
  /** 是否为当前激活态（如当前选中的标题层级、列表类型、对齐方式）。 */
  active: {
    type: Boolean,
  },
};

export type ContextMenuItemProps = ExtractPropTypes<typeof contextMenuItemProps>;

export interface ContextMenuItemSlots {
  /** 菜单项正文内容（覆盖 `title`）。 */
  default: {};
  /** 图标插槽：覆盖 `icon` prop，放置图标组件。 */
  icon: {};
}

export const contextMenuItemSlots = Object as SlotsType<ContextMenuItemSlots>;

export const contextMenuItemEmits = {
  click: (event: MouseEvent) => event instanceof MouseEvent,
};

export type ContextMenuItemEmits = typeof contextMenuItemEmits;
