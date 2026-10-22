/**
 * week-range-picker 的周计算回归测试
 *
 * 跑法：`pnpm test:week`
 *
 * 钉住（都是重构前踩过的点）：
 * 1. 52/53 周由 ISO 规则推导，不再 `isoWeeksInYear()` + `week(n)` 两套混用
 * 2. 周一 00:00 ~ 周日 23:59:59.999，且与界面语言无关
 * 3. 2026-12-31 属于 2026-W53（`en` 语言下曾经被算成 2027-W01）
 * 4. 跨年区间包含 53 周、顺序颠倒能纠正
 * 5. 季度切行：13 列，53 周年多出第 5 行
 */
import assert from 'node:assert/strict';

import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/zh-cn';

import {
  buildYearWeeks,
  groupByQuarter,
  isWeekInSpan,
  quarterOfDate,
  quarterOfWeek,
  stepQuarter,
  weekKeyOf,
  weekSpanOf,
  weeksOfQuarter,
  type WeekItem,
} from './week';

const label = (week: number) => `第${week}周`;
const last = (list: WeekItem[]) => list[list.length - 1];

// 1. 周数由 ISO 规则推出
const weeks2025 = buildYearWeeks(2025, label);
const weeks2026 = buildYearWeeks(2026, label);
const weeks2027 = buildYearWeeks(2027, label);

assert.equal(weeks2025.length, 52);
assert.equal(weeks2026.length, 53);
assert.equal(weeks2027.length, 52);

// 2. 2026 的 W01 从 2025-12-29 开始 —— ISO 周年与日历年可以不同
assert.equal(weeks2026[0].start.format('YYYY-MM-DD'), '2025-12-29');
assert.equal(weeks2026[0].start.isoWeekYear(), 2026);
assert.equal(weeks2026[0].start.year(), 2025);
assert.equal(last(weeks2026).week, 53);
assert.equal(last(weeks2026).end.format('YYYY-MM-DD'), '2027-01-03');

// 3. 每周固定 7 天，周一开始、周日结束
for (const week of weeks2026) {
  assert.equal(week.start.day(), 1);
  assert.equal(week.end.day(), 0);
  assert.equal(week.end.diff(week.start, 'day'), 6);
  assert.equal(week.key, `${week.year}-W${String(week.week).padStart(2, '0')}`);
}

// 4. 与 locale 无关（重构前 en 下 12-31 会被算成第 1 周）
dayjs.locale('en');

const weeks2026InEn = buildYearWeeks(2026, label);

assert.deepEqual(
  weeks2026InEn.map((week) => week.key),
  weeks2026.map((week) => week.key),
);
assert.deepEqual(
  weeks2026InEn.map((week) => week.start.format('YYYY-MM-DD')),
  weeks2026.map((week) => week.start.format('YYYY-MM-DD')),
);
assert.equal(weekKeyOf('2026-12-31'), '2026-W53');
assert.equal(weekKeyOf('2027-01-01'), '2026-W53');
assert.equal(weekKeyOf('2025-12-29'), '2026-W01');

dayjs.locale('zh-cn');

// 5. 季度切行：13 列，53 周年独享第 5 行
const rows2026 = groupByQuarter(weeks2026);
const rows2025 = groupByQuarter(weeks2025);

assert.deepEqual(
  rows2025.map((row) => row.length),
  [13, 13, 13, 13],
);
assert.deepEqual(
  rows2026.map((row) => row.length),
  [13, 13, 13, 13, 1],
);

// 6. 跨年区间：2026 W53 -> 2027 W02 必须包含 53 周
const span = weekSpanOf([new Date('2026-12-28'), new Date('2027-01-15')]);

assert.ok(span);
assert.equal(span.start.format('YYYY-MM-DD'), '2026-12-28');
assert.equal(span.end.format('YYYY-MM-DD'), '2027-01-17');
assert.ok(isWeekInSpan(last(weeks2026), span));
assert.ok(isWeekInSpan(weeks2027[1], span));
assert.ok(!isWeekInSpan(weeks2026[50], span));

// 7. 顺序颠倒能自动纠正
const reversed = weekSpanOf([new Date('2027-01-15'), new Date('2026-12-28')]);

assert.ok(reversed);
assert.equal(reversed.start.format('YYYY-MM-DD'), '2026-12-28');
assert.equal(reversed.end.format('YYYY-MM-DD'), '2027-01-17');

// 8. 空值
assert.equal(weekSpanOf(null), null);
assert.equal(weekSpanOf([]), null);
assert.equal(weekSpanOf([null, null]), null);

// 9. disabledWeek 透传到每个周
const disabled = buildYearWeeks(2026, label, (week) => week.week === 10);

assert.equal(disabled[9].disabled, true);
assert.equal(disabled[10].disabled, false);

// 10. 季度分页：一屏 13 周，53 周年的第 53 周归 Q4
assert.equal(quarterOfWeek(1), 1);
assert.equal(quarterOfWeek(13), 1);
assert.equal(quarterOfWeek(14), 2);
assert.equal(quarterOfWeek(39), 3);
assert.equal(quarterOfWeek(40), 4);
assert.equal(quarterOfWeek(52), 4);
assert.equal(quarterOfWeek(53), 4);

assert.deepEqual(quarterOfDate('2026-03-09'), { year: 2026, quarter: 1 });
assert.deepEqual(quarterOfDate('2026-04-19'), { year: 2026, quarter: 2 });
assert.deepEqual(quarterOfDate('2027-01-01'), { year: 2026, quarter: 4 });

for (let year = 2020; year <= 2030; year++) {
  const weeks = buildYearWeeks(year, label);
  const sizes = [1, 2, 3, 4].map((quarter) => weeksOfQuarter(weeks, quarter).length);

  assert.equal(
    sizes.reduce((a, b) => a + b, 0),
    weeks.length,
    `${year} 年季度切分丢周`,
  );
  assert.ok(
    sizes[0] === 13 && sizes[1] === 13 && sizes[2] === 13 && sizes[3] >= 13,
    `${year} 年季度周数异常: ${sizes.join('/')}`,
  );
  weeksOfQuarter(weeks, 4).forEach((week) => assert.equal(quarterOfWeek(week.week), 4));
}

// 11. 季度跳转跨年进位
assert.deepEqual(stepQuarter({ year: 2026, quarter: 1 }, 1), { year: 2026, quarter: 2 });
assert.deepEqual(stepQuarter({ year: 2026, quarter: 4 }, 1), { year: 2027, quarter: 1 });
assert.deepEqual(stepQuarter({ year: 2026, quarter: 1 }, -1), { year: 2025, quarter: 4 });
assert.deepEqual(stepQuarter({ year: 2026, quarter: 4 }, 4), { year: 2027, quarter: 4 });

console.log('week: ok');
