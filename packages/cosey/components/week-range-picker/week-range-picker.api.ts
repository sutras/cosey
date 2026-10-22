import type { ExtractPropTypes, PropType, SlotsType } from 'vue';
import { isNullish } from '../../utils';
import { timePickerDefaultProps } from 'element-plus';
import type { WeekDisabledHandler } from './week';

export interface WeekShortcut {
  text: string;
  /** 返回 `[起始, 结束]`，组件会各自对齐到所在的 ISO 周 */
  value: () => [Date, Date];
}

export const weekRangePickerProps = {
  ...timePickerDefaultProps,
  modelValue: {
    type: Array as PropType<Date[]>,
  },
  /** 输入框展示格式，默认 `2026 W05` */
  format: {
    type: String,
    default: 'GGGG [W]WW',
  },
  /** 禁用某些周（返回 true 的周不可选，键盘移动时也会跳过） */
  disabledWeek: {
    type: Function as PropType<WeekDisabledHandler>,
  },
  /** 快捷选项，默认内置「本周 / 上周 / 近 4 周 / 本月 / 本年」；传 `[]` 收起 */
  shortcuts: {
    type: Array as PropType<WeekShortcut[]>,
  },
};

export type WeekRangePickerProps = ExtractPropTypes<typeof weekRangePickerProps>;

export interface WeekRangePickerSlots {
  /** 两个输入框之间的分隔符 */
  'range-separator': {};
}

export const weekRangePickerSlots = {} as SlotsType<WeekRangePickerSlots>;

export const weekRangePickerEmits = {
  'update:modelValue': (value: Date[] | null | undefined) =>
    Array.isArray(value) || isNullish(value),
  change: (value: Date[] | null | undefined) => Array.isArray(value) || isNullish(value),
  clear: () => true,
  focus: (event: FocusEvent) => event instanceof FocusEvent,
  blur: (event: FocusEvent) => event instanceof FocusEvent,
  'visible-change': (visible: boolean) => typeof visible === 'boolean',
};

export type WeekRangePickerEmits = typeof weekRangePickerEmits;

export interface WeekRangePickerExpose {
  focus: () => void;
  blur: () => void;
  handleOpen: () => void;
  handleClose: () => void;
}

export type { WeekDisabledHandler, WeekEntry, WeekItem } from './week';
