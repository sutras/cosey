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
};

export type ContextMenuItemProps = ExtractPropTypes<typeof contextMenuItemProps>;

export interface ContextMenuItemSlots {
  default: {};
}

export const contextMenuItemSlots = Object as SlotsType<ContextMenuItemSlots>;

export const contextMenuItemEmits = {
  click: (event: MouseEvent) => event instanceof MouseEvent,
};

export type ContextMenuItemEmits = typeof contextMenuItemEmits;
