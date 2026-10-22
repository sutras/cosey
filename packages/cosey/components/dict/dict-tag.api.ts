import { type ExtractPropTypes, type PropType, type SlotsType } from 'vue';
import { type DictItem, type DictName } from '../../dict';

export const dictTagProps = {
  /** 字典名，需先通过 `launch({ dict })` 或 `registerDicts()` 注册 */
  dict: {
    type: String as PropType<DictName>,
  },
  /** 当前值 */
  value: {
    type: [String, Number, Boolean] as PropType<string | number | boolean>,
  },
  /** 直接传字典项，优先级高于 `dict`（适合一次性数据） */
  options: {
    type: Array as PropType<DictItem[]>,
  },
  /** 覆盖颜色 */
  type: {
    type: String,
  },
  size: {
    type: String as PropType<'large' | 'default' | 'small'>,
  },
  effect: {
    type: String as PropType<'dark' | 'light' | 'plain'>,
  },
  /** 找不到字典项时的文案，默认回退到原值 */
  fallback: {
    type: String,
  },
};

export type DictTagProps = ExtractPropTypes<typeof dictTagProps>;

export interface DictTagSlots {
  default: { label: string; item?: DictItem };
}

export const dictTagSlots = Object as SlotsType<DictTagSlots>;

export const dictTagEmits = {};
