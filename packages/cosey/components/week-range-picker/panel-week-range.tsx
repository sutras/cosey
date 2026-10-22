import { computed, defineComponent, nextTick, onMounted, ref, watch } from 'vue';
import { ElIcon } from 'element-plus';
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue';
import dayjs, { type Dayjs } from 'dayjs';
import { panelWeekRangeProps } from './panel-week-range.api';
import {
  buildYearWeeks,
  isWeekInSpan,
  quarterOfDate,
  startOfIsoWeek,
  stepQuarter,
  weekKeyOf,
  weekSpanOf,
  weeksOfQuarter,
  type WeekItem,
} from './week';
import type { WeekShortcut } from './week-range-picker.api';
import { useLocale } from '../../hooks';
import { createBem } from '../../utils';

export default defineComponent({
  name: 'CoPanelWeekRange',
  props: panelWeekRangeProps,

  setup(props) {
    const { t } = useLocale();

    const bem = createBem('panel-week-range');

    const todayKey = weekKeyOf(dayjs());

    /** 当前浏览的季度 */
    const block = ref(quarterOfDate(dayjs()));
    /** 已点的第一个周，为 null 表示还没开始选 */
    const pendingStart = ref<WeekItem | null>(null);
    const hovered = ref<WeekItem | null>(null);
    const focusKey = ref(todayKey);
    const gridRef = ref<HTMLElement>();

    const label = (week: number) => t('co.form.week', { w: week });

    const span = computed(() => {
      if (pendingStart.value) {
        const a = pendingStart.value;
        const b = hovered.value ?? a;

        return a.start.isAfter(b.start)
          ? { start: b.start, end: a.end }
          : { start: a.start, end: b.end };
      }

      return weekSpanOf(props.parsedValue);
    });

    const quarterWeeks = computed(() =>
      weeksOfQuarter(
        buildYearWeeks(block.value.year, label, props.disabledWeek),
        block.value.quarter,
      ),
    );

    /** 7 列 × 2 行，13 周的季度第二行少一格，53 周年正好填满 */
    const rows = computed(() => {
      const weeks = quarterWeeks.value;
      const size = Math.ceil(weeks.length / 2);

      return [weeks.slice(0, size), weeks.slice(size)];
    });

    const findWeek = (key: string) => quarterWeeks.value.find((item) => item.key === key);

    const isDisabled = (date: Dayjs) => {
      if (!props.disabledWeek) return false;

      const start = startOfIsoWeek(date);

      return props.disabledWeek({
        year: start.isoWeekYear(),
        week: start.isoWeek(),
        start: start.toDate(),
        end: start.add(6, 'day').endOf('day').toDate(),
      });
    };

    const focusCell = (key: string) => {
      // 面板刚挂载/刚换季度时格子可能还没渲染，重试几帧
      const tryFocus = (attempt: number) => {
        const el = gridRef.value?.querySelector<HTMLElement>(`[data-week="${key}"]`);

        if (el) {
          el.focus();

          return;
        }

        if (attempt < 3) requestAnimationFrame(() => tryFocus(attempt + 1));
      };

      tryFocus(0);
    };

    /** 按周偏移移动焦点；跨季度时顺带把面板翻过去 */
    const moveFocus = (weekOffset: number) => {
      const current = findWeek(focusKey.value);
      const base = current?.start ?? dayjs();
      const step = weekOffset > 0 ? 1 : -1;

      let target = startOfIsoWeek(base).add(weekOffset, 'week');
      let guard = 0;

      while (isDisabled(target) && guard++ < 60) {
        target = target.add(step, 'week');
      }

      const next = quarterOfDate(target);
      block.value = next;
      focusKey.value = weekKeyOf(target);

      nextTick(() => focusCell(focusKey.value));
    };

    const goQuarter = (quarter: number) => {
      block.value = { year: block.value.year, quarter };
    };

    const pickWeek = (item: WeekItem) => {
      if (item.disabled) return;

      if (!pendingStart.value) {
        pendingStart.value = item;
        hovered.value = item;

        return;
      }

      const first = pendingStart.value;
      const [start, end] = first.start.isAfter(item.start) ? [item, first] : [first, item];

      pendingStart.value = null;
      hovered.value = null;

      props.onPick?.([start.start, end.end]);
    };

    const onHover = (item: WeekItem) => {
      if (!pendingStart.value || item.disabled) return;

      hovered.value = item;
    };

    const applyShortcut = (shortcut: WeekShortcut) => {
      const [start, end] = shortcut.value();

      pendingStart.value = null;
      hovered.value = null;

      props.onPick?.([startOfIsoWeek(start), dayjs(end).endOf('isoWeek')]);
    };

    const onGridFocus = (event: FocusEvent) => {
      if (event.target === gridRef.value) {
        nextTick(() => focusCell(focusKey.value));
      }
    };

    const onKeydown = (event: KeyboardEvent) => {
      const key = event.key;
      const rowsOffset = onKeydownRowsOffset(key);

      if (rowsOffset !== null) {
        event.preventDefault();
        moveFocus(rowsOffset);

        return;
      }

      if (key === 'Enter' || key === ' ') {
        event.preventDefault();
        const item = findWeek(focusKey.value);
        if (item) pickWeek(item);

        return;
      }

      if (key === 'Escape') {
        event.preventDefault();
        props.onClose?.();
      }
    };

    const onKeydownRowsOffset = (key: string): number | null => {
      switch (key) {
        case 'ArrowLeft':
          return -1;
        case 'ArrowRight':
          return 1;
        case 'ArrowUp':
          return -7;
        case 'ArrowDown':
          return 7;
        case 'PageUp':
          return -13;
        case 'PageDown':
          return 13;
        default:
          return null;
      }
    };

    onMounted(() => {
      props.onSetPickerOption?.([
        'isValidValue',
        (value: Dayjs | Dayjs[]) => {
          if (Array.isArray(value)) return value.length === 2 && value.every((item) => !!item);

          return !!value;
        },
      ]);

      // 输入框里按 ↓ 时 EP 会调它，把焦点交给面板，键盘就能直接接管
      props.onSetPickerOption?.(['handleFocusPicker', () => focusCell(focusKey.value)]);
    });

    watch(
      () => props.visible,
      (visible) => {
        if (!visible) return;

        pendingStart.value = null;
        hovered.value = null;

        const current = weekSpanOf(props.parsedValue);
        const anchor = current ? current.start : dayjs();

        block.value = quarterOfDate(anchor);
        focusKey.value = current ? weekKeyOf(anchor) : todayKey;
      },
      { immediate: true },
    );

    return () => (
      <div class={bem.b()} onMousedown={props.onMousedown}>
        <div class={bem.e('header')}>
          <button
            type="button"
            class={bem.e('nav')}
            aria-label={t('co.form.prevQuarter')}
            onClick={() => (block.value = stepQuarter(block.value, -1))}
          >
            <ElIcon>
              <ArrowLeft />
            </ElIcon>
          </button>
          <span class={bem.e('title')}>{block.value.year}</span>
          <button
            type="button"
            class={bem.e('nav')}
            aria-label={t('co.form.nextQuarter')}
            onClick={() => (block.value = stepQuarter(block.value, 1))}
          >
            <ElIcon>
              <ArrowRight />
            </ElIcon>
          </button>
          <div class={bem.e('quarters')}>
            {[1, 2, 3, 4].map((quarter) => (
              <button
                type="button"
                key={quarter}
                class={[bem.e('quarter'), quarter === block.value.quarter && bem.is('active')]}
                aria-pressed={quarter === block.value.quarter}
                onClick={() => goQuarter(quarter)}
              >
                Q{quarter}
              </button>
            ))}
          </div>
        </div>

        {props.shortcuts?.length ? (
          <div class={bem.e('shortcuts')}>
            {props.shortcuts.map((shortcut) => (
              <button
                type="button"
                class={bem.e('shortcut')}
                key={shortcut.text}
                onClick={() => applyShortcut(shortcut)}
              >
                {shortcut.text}
              </button>
            ))}
          </div>
        ) : null}

        <div
          ref={gridRef}
          class={bem.e('body')}
          role="grid"
          tabindex={0}
          aria-label={`${block.value.year} Q${block.value.quarter}`}
          onKeydown={onKeydown}
          onFocus={onGridFocus}
        >
          {rows.value.map((row, rowIndex) => (
            <div class={bem.e('row')} role="row" key={rowIndex}>
              {row.map((item) => {
                const inRange = isWeekInSpan(item, span.value);
                const isStart = !!span.value && item.start.isSame(span.value.start, 'day');
                const isEnd = !!span.value && item.end.isSame(span.value.end, 'day');

                return (
                  <button
                    type="button"
                    role="gridcell"
                    data-week={item.key}
                    class={[
                      bem.e('cell'),
                      inRange && bem.is('in-range'),
                      isStart && bem.is('start'),
                      isEnd && bem.is('end'),
                      item.disabled && bem.is('disabled'),
                      item.key === todayKey && bem.is('today'),
                    ]}
                    tabindex={item.key === focusKey.value ? 0 : -1}
                    aria-selected={inRange}
                    aria-disabled={item.disabled || undefined}
                    aria-label={`${item.year} ${item.label} ${item.startText}~${item.endText}`}
                    disabled={item.disabled}
                    onClick={() => pickWeek(item)}
                    onPointerenter={() => onHover(item)}
                    onFocus={() => {
                      focusKey.value = item.key;
                    }}
                  >
                    <span class={bem.e('week')}>{item.label}</span>
                    <span class={bem.e('date')}>{item.startText}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  },
});
