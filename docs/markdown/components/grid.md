# Grid 栅格

## 简介

24 栅格系统，使用方式和接口同 [element-plus Layout](https://element-plus.org/zh-CN/component/layout.html)，但响应式断点是相对于容器宽度，而非视口大小。

## 代码演示

### 基础使用

使用列创建基础网格布局。

通过 `row` 和 `col` 组件，并通过 `col` 组件的 `span` 属性我们就可以自由地组合布局。

::: demo

grid/basic

:::

### 分栏间隔

支持列间距。

行提供 `gutter` 属性来指定列之间的间距，其默认值为0。

::: demo

grid/gutter

:::

### 混合布局

通过基础的 1/24 分栏任意扩展组合形成较为复杂的混合布局。

::: demo

grid/hybrid

:::

### 列偏移

您可以指定列偏移量。

通过制定 `col` 组件的 `offset` 属性可以指定分栏偏移的栏数。

::: demo

grid/offset

:::

### 对齐方式

默认使用 `flex` 布局来对分栏进行灵活的对齐。

您可以通过 `justify` 属性来定义子元素的排版方式，其取值为 `start`、`center`、`end`、`space-between`、`space-around`或`space-evenly`。

::: demo

grid/justify

:::

### 响应式布局

参照了 `Bootstrap` 的 响应式设计，预设了六个响应尺寸：`xs`、`sm`、`md`、`lg`、`xl` 和 `xxl`。

::: demo

grid/responsive

:::

### 自定义断点

默认断点为 `[576, 768, 992, 1200, 1600]`, 可通过 `breakpoints` 属性设置其他断点。

::: demo

grid/breakpoints

:::

## API

### RowProps

| 属性        | 描述                           | 类型                                                                                | 默认值                      |
| ----------- | ------------------------------ | ----------------------------------------------------------------------------------- | --------------------------- |
| tag         | 自定义元素标签                 | string                                                                              | 'div'                       |
| gutter      | 列之间的间距                   | number                                                                              | 0                           |
| justify     | flex 布局下的水平排列方式      | 'start' \| 'center' \| 'end' \| 'space-around' \| 'space-between' \| 'space-evenly' | —                           |
| align       | flex 布局下的垂直排列方式      | 'top' \| 'middle' \| 'bottom'                                                       | —                           |
| breakpoints | 自定义断点，用于计算响应式尺寸 | number[]                                                                            | [576, 768, 992, 1200, 1600] |

### RowSlots

| 插槽    | 描述           | 属性 |
| ------- | -------------- | ---- |
| default | 自定义默认内容 | -    |

### ColProps

| 属性   | 描述                               | 类型                    | 默认值 |
| ------ | ---------------------------------- | ----------------------- | ------ |
| tag    | 自定义元素标签                     | string                  | 'div'  |
| span   | 栅格占据的列数                     | number                  | 24     |
| offset | 栅格左侧的间隔格数                 | number                  | 0      |
| push   | 栅格向右移动格数                   | number                  | 0      |
| pull   | 栅格向左移动格数                   | number                  | 0      |
| xs     | 容器宽度小于 576px 时的栅格配置    | number \| ColSizeObject | —      |
| sm     | 容器宽度不小于 576px 时的栅格配置  | number \| ColSizeObject | —      |
| md     | 容器宽度不小于 768px 时的栅格配置  | number \| ColSizeObject | —      |
| lg     | 容器宽度不小于 992px 时的栅格配置  | number \| ColSizeObject | —      |
| xl     | 容器宽度不小于 1200px 时的栅格配置 | number \| ColSizeObject | —      |
| xxl    | 容器宽度不小于 1600px 时的栅格配置 | number \| ColSizeObject | —      |

响应式属性传入 `number` 时表示该尺寸下的 `span`；传入对象时可精确指定各项数值。某个尺寸未设置时，会沿用比它小的最近一个已设置的尺寸。断点由 `row` 的 `breakpoints` 属性决定，测量的是 `row` 容器的宽度而非视口宽度。

### ColSizeObject

| 属性   | 描述               | 类型   | 默认值 |
| ------ | ------------------ | ------ | ------ |
| span   | 栅格占据的列数     | number | —      |
| offset | 栅格左侧的间隔格数 | number | —      |
| push   | 栅格向右移动格数   | number | —      |
| pull   | 栅格向左移动格数   | number | —      |

### ColSlots

| 插槽    | 描述           | 属性 |
| ------- | -------------- | ---- |
| default | 自定义默认内容 | -    |
