import { type Component, type ExtractPropTypes, type PropType, type SlotsType } from 'vue';

export const contextMenuContentProps = {
  icon: {
    /** 图标组件，或图标名（如 `co:user`） */
    type: [String, Object, Function] as PropType<string | Component>,
  },
  withIcon: {
    type: Boolean,
  },
  title: {
    type: String,
  },
  arrow: {
    type: Boolean,
  },
  disabled: {
    type: Boolean,
  },
  hover: {
    type: Boolean,
  },
  active: {
    type: Boolean,
  },
};

export type ContextMenuContentProps = ExtractPropTypes<typeof contextMenuContentProps>;

export interface ContextMenuContentSlots {
  default: {};
  /** 图标插槽：覆盖默认的 `content-icon` 列，可放置任意图标组件。 */
  icon: {};
}

export const contextMenuContentSlots = Object as SlotsType<ContextMenuContentSlots>;

export const contextMenuContentEmits = {
  click: (event: MouseEvent) => event instanceof MouseEvent,
};

export type ContextMenuContentEmits = typeof contextMenuContentEmits;
