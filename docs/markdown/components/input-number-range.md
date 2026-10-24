# InputNumberRange 数字范围输入框

## 简介

两个数字输入框拼成的范围输入，值是 `[开始, 结束]` 数组。两端都填上才会产生值，清空任意一端回到 `undefined`；填反了（开始大于结束）会在离开组件时自动交换成「小 - 大」。在表单里用 `field-type="numberrange"`。

## 代码演示

### 基础使用

`v-model` 绑定 `[开始, 结束]`；只有两端都填上时才更新，`change` 也只在完整时触发。填反了不会中途打断输入，失焦后自动交换两个值（传进来的初值倒挂也会被纠正）。

::: demo

input-number-range/basic

:::

### 范围与精度

`min` / `max` 限制取值区间，`precision` 控制小数位，`step` 是步进；`step-strictly` 只能取 `step` 的整数倍。

::: demo

input-number-range/constraint

:::

### 禁用与只读

`disabled` 完全不可交互；`readonly` 可聚焦、可复制但不能改。只填一端时 `model-value` 保持 `undefined`。

::: demo

input-number-range/state

:::

### 在表单里使用

字段类型是 `numberrange`，`required` 要两端都填上才算通过；`field-props` 里传的 `min` / `max` / `step` 会透给组件。

::: demo

input-number-range/form

:::

## API

### InputNumberRangeProps

| 属性                  | 描述                          | 类型     | 默认值 |
| --------------------- | ----------------------------- | -------- | ------ |
| model-value (v-model) | 绑定的范围值                  | number[] | -      |
| min                   | 允许的最小值（两端共用）      | number   | -      |
| max                   | 允许的最大值（两端共用）      | number   | -      |
| step                  | 计数器步长                    | number   | -      |
| step-strictly         | 是否只能输入 step 的倍数      | boolean  | false  |
| precision             | 数值精度                      | number   | -      |
| start-placeholder     | 开始输入框的 placeholder 属性 | string   | -      |
| end-placeholder       | 结束输入框的 placeholder 属性 | string   | -      |
| readonly              | 是否只读                      | boolean  | false  |
| disabled              | 是否禁用                      | boolean  | false  |
| validate-event        | 是否触发表单验证              | boolean  | true   |

### InputNumberRangeEmits

| 事件              | 描述               | 类型                                   |
| ----------------- | ------------------ | -------------------------------------- |
| update:modelValue | 绑定值被改变时触发 | (value: number[] \| undefined) => void |
| change            | 绑定值被改变时触发 | (value: number[] \| undefined) => void |
