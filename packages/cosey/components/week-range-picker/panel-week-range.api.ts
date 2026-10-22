import type { PropType } from 'vue';
import type { Dayjs } from 'dayjs';
import type { WeekShortcut } from './week-range-picker.api';
import type { WeekDisabledHandler } from './week';

export const panelWeekRangeProps = {
  visible: {
    type: Boolean,
  },
  parsedValue: {
    type: Array as PropType<(Dayjs | null)[]>,
  },
  disabledWeek: {
    type: Function as PropType<WeekDisabledHandler>,
  },
  shortcuts: {
    type: Array as PropType<WeekShortcut[]>,
  },
  /** EP `CommonPicker` 通过 default 插槽注入：提交选中的周区间 */
  onPick: {
    type: Function as PropType<(value: Dayjs[], visible?: boolean) => void>,
  },
  /** EP `CommonPicker` 通过 default 插槽注入：注册面板能力 */
  onSetPickerOption: {
    type: Function as PropType<(option: [string, any]) => void>,
  },
  /** EP `CommonPicker` 通过 default 插槽注入：阻止输入框失焦 */
  onMousedown: {
    type: Function as PropType<(event: MouseEvent) => void>,
  },
  /** 由 picker 注入：关闭弹层（Esc 用） */
  onClose: {
    type: Function as PropType<() => void>,
  },
};
