import { type Component, type ExtractPropTypes, type PropType } from 'vue';

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
};

export type ContextMenuContentProps = ExtractPropTypes<typeof contextMenuContentProps>;
