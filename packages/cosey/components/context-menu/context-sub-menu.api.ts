import { type Component, type SlotsType, type ExtractPropTypes, type PropType } from 'vue';

export const contextSubMenuProps = {
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

export type ContextSubMenuProps = ExtractPropTypes<typeof contextSubMenuProps>;

export interface ContextSubMenuSlots {
  default: {};
  /** 图标插槽：覆盖 `icon` prop，放置图标组件。 */
  icon: {};
}

export const contextSubMenuSlots = Object as SlotsType<ContextSubMenuSlots>;
