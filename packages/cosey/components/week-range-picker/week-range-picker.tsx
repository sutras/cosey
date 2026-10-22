import { computed, defineComponent, ref } from 'vue';
import { CommonPicker, UPDATE_MODEL_EVENT } from 'element-plus';
import dayjs from 'dayjs';
import {
  type WeekRangePickerExpose,
  type WeekShortcut,
  weekRangePickerEmits,
  weekRangePickerProps,
  weekRangePickerSlots,
} from './week-range-picker.api';
import PanelWeekRange from './panel-week-range';
import { startOfIsoWeek } from './week';
import { useLocale } from '../../hooks';
import { createBem } from '../../utils';

export default defineComponent({
  name: 'CoWeekRangePicker',
  props: weekRangePickerProps,
  slots: weekRangePickerSlots,
  emits: weekRangePickerEmits,
  setup(props, { emit, expose, slots }) {
    const bem = createBem('week-range-picker');

    const { t } = useLocale();

    const commonPicker = ref<InstanceType<typeof CommonPicker>>();

    /** 内置快捷项，按当前日期现算，跨天打开也不会停在昨天 */
    const builtinShortcuts = computed<WeekShortcut[]>(() => {
      const weekStart = startOfIsoWeek(dayjs());

      const weekRange = (offset: number): [Date, Date] => [
        weekStart.subtract(offset, 'week').toDate(),
        weekStart.subtract(offset, 'week').add(6, 'day').toDate(),
      ];

      return [
        { text: t('co.form.thisWeek'), value: () => weekRange(0) },
        { text: t('co.form.lastWeek'), value: () => weekRange(1) },
        {
          text: t('co.form.recentWeeks'),
          value: () => [weekStart.subtract(3, 'week').toDate(), weekStart.add(6, 'day').toDate()],
        },
        {
          text: t('co.form.thisMonth'),
          value: () => [dayjs().startOf('month').toDate(), dayjs().endOf('month').toDate()],
        },
        {
          text: t('co.form.thisYear'),
          value: () => [dayjs().startOf('year').toDate(), dayjs().endOf('year').toDate()],
        },
      ];
    });

    const shortcuts = computed(() => props.shortcuts ?? builtinShortcuts.value);

    /** `disabledWeek` / `shortcuts` 是本组件的私有属性，不能漏给 el-tooltip */
    const pickerProps = computed(() => {
      const rest: Record<string, any> = { ...props };

      delete rest.disabledWeek;
      delete rest.shortcuts;

      return rest;
    });

    const refProps: WeekRangePickerExpose = {
      focus: () => {
        commonPicker.value?.focus();
      },
      blur: () => {
        commonPicker.value?.blur();
      },
      handleOpen: () => {
        commonPicker.value?.handleOpen();
      },
      handleClose: () => {
        commonPicker.value?.handleClose();
      },
    };

    expose(refProps);

    return () => (
      <CommonPicker
        {...(pickerProps.value as any)}
        ref={commonPicker}
        type="weekrange"
        editable={false}
        class={bem.b()}
        onUpdate:modelValue={(value: Date[] | null) => emit(UPDATE_MODEL_EVENT, value)}
        onChange={(value: Date[] | null) => emit('change', value)}
        onClear={() => emit('clear')}
        onFocus={(event: FocusEvent) => emit('focus', event)}
        onBlur={(event: FocusEvent) => emit('blur', event)}
        onVisibleChange={(visible: boolean) => emit('visible-change', visible)}
      >
        {{
          default: (scopedProps: any) => {
            if (!scopedProps.visible && !scopedProps.actualVisible) return null;

            return (
              <PanelWeekRange
                {...scopedProps}
                disabledWeek={props.disabledWeek}
                shortcuts={shortcuts.value}
                onClose={() => commonPicker.value?.handleClose()}
              />
            );
          },
          'range-separator':
            slots['range-separator'] ?? (() => <span class={bem.e('separator')}>–</span>),
        }}
      </CommonPicker>
    );
  },
});
