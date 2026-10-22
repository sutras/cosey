# WeekRangePicker 周范围选择器

## 简介

按周选择连续区间。周固定为 **ISO 周（周一 00:00:00 ~ 周日 23:59:59.999）**，不随界面语言变化，`v-model` 即这两端的时间戳。

键盘：`←` / `→` 移动一周，`↑` / `↓` 跨一行，`PageUp` / `PageDown` 换季度，`Enter` 选中，`Esc` 关闭。

## 代码演示

### 基础使用

输入框展示格式由 `format` 决定，默认 `2026 W05`。

::: demo

week-range-picker/basic

:::

### 禁用部分周

`disabled-week` 收到该周的 `{ year, week, start, end }`，返回 `true` 即不可选 —— 点击无效，键盘移动时也会跳过。

::: demo

week-range-picker/disabled

:::

### 自定义快捷项

不传 `shortcuts` 时内置「本周 / 上周 / 近 4 周 / 本月 / 本年」；传入自己的数组会整体替换，传 `[]` 则收起。

::: demo

week-range-picker/shortcuts

:::

### 跨年选择

值跨年时，面板打开在起始周所在季度。

::: demo

week-range-picker/cross-year

:::

## API

### WeekRangePickerProps

| 属性              | 描述                              | 类型                           | 默认值       |
| ----------------- | --------------------------------- | ------------------------------ | ------------ |
| model-value       | 周区间，两端分别对齐到周一 / 周日 | `Date[]` &#124; `null`         | -            |
| format            | 输入框展示格式                    | string                         | `GGGG [W]WW` |
| disabled-week     | 禁用某些周                        | `(week: WeekEntry) => boolean` | -            |
| shortcuts         | 快捷项，`[]` 收起内置项           | `WeekShortcut[]`               | 内置 5 项    |
| start-placeholder | 开始输入框的 placeholder          | string                         | -            |
| end-placeholder   | 结束输入框的 placeholder          | string                         | -            |
| readonly          | 是否只读                          | boolean                        | false        |
| disabled          | 是否禁用                          | boolean                        | false        |
| clearable         | 是否可清空                        | boolean                        | true         |
| validate-event    | 是否触发表单验证                  | boolean                        | true         |

其余属性（`size`、`popper-class` 等）透传 `el-date-picker` 的公共属性。输入框不支持手动输入。

### WeekRangePickerSlots

| 插槽            | 描述                 | 属性 |
| --------------- | -------------------- | ---- |
| range-separator | 两个输入框之间的分隔 | -    |

### WeekRangePickerEmits

| 事件              | 描述               | 类型                              |
| ----------------- | ------------------ | --------------------------------- |
| update:modelValue | 绑定值被改变时触发 | `(value: Date[] \| null) => void` |
| change            | 绑定值被改变时触发 | `(value: Date[] \| null) => void` |
| clear             | 点击清空按钮时触发 | `() => void`                      |
| focus / blur      | 输入框聚焦 / 失焦  | `(event: FocusEvent) => void`     |
| visible-change    | 面板展开 / 收起    | `(visible: boolean) => void`      |

### WeekRangePickerExpose

| 方法        | 描述       |
| ----------- | ---------- |
| focus       | 聚焦输入框 |
| blur        | 失焦       |
| handleOpen  | 展开面板   |
| handleClose | 收起面板   |

### 类型

```ts
interface WeekEntry {
  /** ISO 周年，可能不等于 start 的日历年 */
  year: number;
  /** ISO 周号 1 ~ 53 */
  week: number;
  /** 周一 00:00:00.000 */
  start: Date;
  /** 周日 23:59:59.999 */
  end: Date;
}

interface WeekShortcut {
  text: string;
  value: () => [Date, Date];
}
```
