import { type SlotsType, type ExtractPropTypes, PropType } from 'vue';

/** 图标颜色，与 Element Plus 的语义色保持一致 */
export type CopyType = 'primary' | 'success' | 'warning' | 'danger' | 'info';

export const copyProps = {
  /** 要复制的文本 */
  text: {
    type: String,
  },
  /** 直接指定颜色，优先级高于 `type` */
  color: {
    type: String,
  },
  type: {
    type: String as PropType<CopyType>,
  },
  /** 无障碍标签，默认取语言包里的「复制」 */
  label: {
    type: String,
  },
};

export type CopyProps = ExtractPropTypes<typeof copyProps>;

export interface CopySlots {
  default: {};
}

export const copySlots = Object as SlotsType<CopySlots>;
