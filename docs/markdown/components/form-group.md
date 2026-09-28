# FormGroup 折叠表单组

## 简介

`FormGroup` 是 `ElSpace` 的高阶组件，用于把表单字段分组 —— 可选带标题、边框和折叠。
有 `title` 时会渲染边框，`collapsible` 打开后点标题即可收起 / 展开。

`size`、`direction`、`alignment`、`wrap` 等 `ElSpace` 的能力都会原样透传，
所以横向排列、纵向堆叠、自定义间距都可以直接用。

放在 `Form` 里使用时，**校验失败会自动展开包含出错字段的分组**：
收起状态下字段是被 `display: none` 藏起来的，`FormItem` 却仍然参与校验，
错误信息用户根本看不见。

## 代码演示

### 基础用法

有 `title` 时渲染标题与边框；没有 `title` 时只是一个分组容器，不渲染边框。

::: demo

form-group/basic

:::

### 可折叠

设置 `collapsible` 后点标题即可收起 / 展开，标题左侧会出现指示箭头。

`collapsed` 支持 `v-model:collapsed`，所以折叠状态也可以完全交给外部控制。

::: demo

form-group/collapsible

:::

### 标题位置

`position` 控制标题贴在左边、居中还是右边，默认在左。

::: demo

form-group/position

:::

### 边框样式

`border-style` 支持 `solid` / `dashed` / `dotted` / `none`，
不设置时沿用 `ElSpace` 的边框变量（实线）；`none` 可以只保留标题和留白。

::: demo

form-group/border-style

:::

### 自定义标题与提示

用 `title` 插槽自定义标题内容（比如补一个标签），用 `tooltip` 插槽自定义标题旁边的提示气泡。

::: demo

form-group/title-slot

:::

### 间距、方向与对齐

`size` 默认 `[32, 0]`（横向间距 32、纵向 0），传数组可以分别控制两个方向的间距。

`alignment` 在各项高度不一致时才有视觉效果 —— 比如下面第三个分组里，多行输入框比单行输入框高。

::: demo

form-group/layout

:::

### 嵌套分组

分组可以嵌套，内层同样可以折叠。

::: demo

form-group/nested

:::

### 校验失败自动展开

第二个分组默认收起，点「提交」后会自动展开；配合表单的滚动定位，能直接看到是哪个字段出错。

不需要这个行为时，把 `switch-to-invalid` 设为 `false`。

::: demo

form-group/invalid

:::

## API

### FormGroupProps

继承 `element-plus` 的 [Space Attributes](https://element-plus.org/zh-CN/component/space.html#attributes)，并有以下额外属性。

| 属性              | 描述                                   | 类型                                                          | 默认值       |
| ----------------- | -------------------------------------- | ------------------------------------------------------------- | ------------ |
| alignment         | 主轴对齐方式                           | 'stretch' \| 'center' \| 'flex-start' \| 'flex-end'           | 'flex-start' |
| size              | 间距                                   | number \| 'default' \| 'small' \| 'large' \| [number, number] | [32, 0]      |
| wrap              | 是否自动换行                           | boolean                                                       | true         |
| title             | 分组标题，有标题时渲染边框             | VNodeChild                                                    | -            |
| tooltip           | 标题旁的提示内容                       | VNodeChild                                                    | -            |
| border-style      | 边框样式                               | 'none' \| 'solid' \| 'dashed' \| 'dotted'                     | -            |
| position          | 标题位置                               | 'left' \| 'right' \| 'center'                                 | 'left'       |
| collapsible       | 是否可折叠                             | boolean                                                       | -            |
| collapsed         | 是否收起（支持 `v-model:collapsed`）   | boolean                                                       | -            |
| switch-to-invalid | 校验失败时自动展开，把出错的字段露出来 | boolean                                                       | true         |

### FormGroupSlots

| 插槽名  | 描述           |
| ------- | -------------- |
| default | 分组内容       |
| title   | 自定义标题     |
| tooltip | 自定义提示内容 |

### FormGroupEmits

| 事件名           | 描述         | 参数                   |
| ---------------- | ------------ | ---------------------- |
| update:collapsed | 折叠状态变化 | `(collapsed: boolean)` |
