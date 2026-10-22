import dayjs, { type Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek.js';

dayjs.extend(isoWeek);

/** 一年的周视图单元 */
export interface WeekItem {
  /** `2026-W05`，跨年比较的唯一标识 */
  key: string;
  /** ISO 周年（可能不等于 start 的日历年） */
  year: number;
  /** ISO 周号 1..53 */
  week: number;
  /** 已翻译的周文案，如「第5周」 */
  label: string;
  /** 周一 00:00:00.000 */
  start: Dayjs;
  /** 周日 23:59:59.999 */
  end: Dayjs;
  startText: string;
  endText: string;
  disabled: boolean;
}

export interface WeekEntry {
  year: number;
  week: number;
  start: Date;
  end: Date;
}

export type WeekDisabledHandler = (week: WeekEntry) => boolean;

/** 一周最多 53 个，按季度切行正好 13 列 */
export const WEEKS_PER_QUARTER = 13;

const pad = (n: number) => String(n).padStart(2, '0');

export function startOfIsoWeek(date: Dayjs | Date | string | number): Dayjs {
  return dayjs(date).startOf('isoWeek');
}

export function endOfIsoWeek(date: Dayjs | Date | string | number): Dayjs {
  return dayjs(date).endOf('isoWeek');
}

export function weekKeyOf(date: Dayjs | Date | string | number): string {
  const d = startOfIsoWeek(date);

  return `${d.isoWeekYear()}-W${pad(d.isoWeek())}`;
}

/**
 * 构建某一年的周列表。
 *
 * 从 1 月 4 日（必落在 ISO 第 1 周）所在周的周一开始按 7 天步进，
 * 直到 ISO 周年变化为止 —— 这样 52/53 周自然成立，不需要 `isoWeeksInYear`。
 */
export function buildYearWeeks(
  year: number,
  label: (week: number) => string,
  disabled?: WeekDisabledHandler,
): WeekItem[] {
  const weeks: WeekItem[] = [];

  let cursor = startOfIsoWeek(`${year}-01-04`);

  while (cursor.isoWeekYear() === year) {
    const week = cursor.isoWeek();
    const end = cursor.add(6, 'day').endOf('day');
    const entry: WeekEntry = {
      year,
      week,
      start: cursor.toDate(),
      end: end.toDate(),
    };

    weeks.push({
      key: `${year}-W${pad(week)}`,
      year,
      week,
      label: label(week),
      start: cursor,
      end,
      startText: cursor.format('MM-DD'),
      endText: end.format('MM-DD'),
      disabled: disabled ? disabled(entry) : false,
    });

    cursor = cursor.add(1, 'week');
  }

  return weeks;
}

export function groupByQuarter(weeks: WeekItem[]): WeekItem[][] {
  const rows: WeekItem[][] = [];

  for (let i = 0; i < weeks.length; i += WEEKS_PER_QUARTER) {
    rows.push(weeks.slice(i, i + WEEKS_PER_QUARTER));
  }

  return rows;
}

/** 周号 → 季度 1..4（53 周年的第 53 周归 Q4） */
export function quarterOfWeek(week: number): number {
  return Math.min(4, Math.ceil(week / WEEKS_PER_QUARTER));
}

export interface YearQuarter {
  year: number;
  quarter: number;
}

/** 某个日期（按其所在 ISO 周）落在哪个季度 */
export function quarterOfDate(date: Dayjs | Date | string | number): YearQuarter {
  const d = startOfIsoWeek(date);

  return { year: d.isoWeekYear(), quarter: quarterOfWeek(d.isoWeek()) };
}

/** 取某个季度的周；Q4 含 53 周年的第 53 周，所以是 13 或 14 个 */
export function weeksOfQuarter(weeks: WeekItem[], quarter: number): WeekItem[] {
  const from = (quarter - 1) * WEEKS_PER_QUARTER;
  const to = quarter === 4 ? weeks.length : quarter * WEEKS_PER_QUARTER;

  return weeks.slice(from, to);
}

/** 季度的前后跳转（跨年自动进位） */
export function stepQuarter(current: YearQuarter, delta: number): YearQuarter {
  const index = current.year * 4 + (current.quarter - 1) + delta;

  return { year: Math.floor(index / 4), quarter: (index % 4) + 1 };
}

export interface WeekSpan {
  start: Dayjs;
  end: Dayjs;
}

/** 把 model 值（任意两个日期）对齐成 ISO 周区间，顺序颠倒也能纠正 */
export function weekSpanOf(value?: (Dayjs | Date | null)[] | null): WeekSpan | null {
  if (!value || value.length < 2 || !value[0] || !value[1]) return null;

  const raw = value.map((item) => dayjs(item as Date).startOf('isoWeek'));
  const [first, second] = raw[0].isAfter(raw[1]) ? [raw[1], raw[0]] : raw;

  return {
    start: first,
    end: second.endOf('isoWeek'),
  };
}

/** 判断某个周是否落在区间内（按周起点比较，避免跨年时数值编码错位） */
export function isWeekInSpan(week: WeekItem, span: WeekSpan | null): boolean {
  if (!span) return false;

  return !week.start.isBefore(span.start, 'day') && !week.start.isAfter(span.end, 'day');
}
