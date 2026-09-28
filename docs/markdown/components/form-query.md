# FormQuery 查询表单

## 简介

`FormQuery` 是预设了栅格布局的 `Form` 组件，拥有相同的接口，并添加了折叠功能，通常和表格组件一起使用。

## 代码演示

### 基础演示

::: demo

form-query/basic

:::

### 默认展开

使用 `collapsed` 属性设置折叠状态，也可以用 `v-model:collapsed` 双向绑定。

::: demo

form-query/expand

:::

### 最小显示表单项数

默认在折叠状态下会显示一行的表单控件，通过 `min-fields` 属性可以设置折叠时显示的固定数量的表单控件。

::: demo

form-query/min-fields

:::

### 隐藏折叠按钮

设置 `:min-fields="0"` 可以隐藏折叠按钮。

::: demo

form-query/hide-toggle

:::

### 垂直排布

设置 `label-position="top"` 实现垂直排布，可以使表单控件有更多的展示空间。

::: demo

form-query/vertical

:::

### 校验失败自动展开

收起状态下被隐藏的字段**仍然参与校验**（`FormItem` 只是被设成 `display: none`），
出错却完全看不见 —— 用户会以为「点了查询没反应」。所以校验失败时表单会自动展开。

::: demo

form-query/invalid

:::

## API

### FormQueryProps

继承 [FormProps](./form#formprops)，并有以下额外属性或默认值。

| 属性              | 描述                                                                                                                        | 类型                      | 默认值                                   |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ---------------------------------------- |
| grid              | 是否开启栅格化模式                                                                                                          | boolean                   | true                                     |
| col-props         | 栅格化模式下设置所有 `field` 共同的 `Col` 的属性                                                                            | ColProps                  | \{ xs: 24, sm: 12, md: 8, lg: 6, xl: 6 } |
| min-fields        | 自定义折叠状态下默认显示的表单控件数量，小于 0，则显示一行控件； 等于 0，则显示所有控件；数量大于等于控件数量则隐藏展开按钮 | number                    | -1                                       |
| collapsed         | 是否折叠超出的表单项                                                                                                        | boolean                   | true                                     |
| reset-values      | 点击重置按钮时，可以用指定表单值来重置                                                                                      | () => Record<string, any> | -                                        |
| switch-to-invalid | 校验失败时自动展开，把出错的字段露出来                                                                                      | boolean                   | true                                     |

### FormQuerySlots

继承 [FormSlots](./form#formslots)。

### FormQueryEmits

继承 [FormEmits](./form#formemits)，并有以下额外事件。

| 事件             | 描述               | 类型                         |
| ---------------- | ------------------ | ---------------------------- |
| update:collapsed | 折叠状态改变时触发 | (collapsed: boolean) => void |

### FormQueryExpose

继承 [FormExpose](./form#formexpose)。
