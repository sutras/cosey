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

继承 [Row Attributes](https://element-plus.org/zh-CN/component/layout.html#row-attributes)，并添加以下属性：

| 属性        | 描述       | 类型     | 默认值                      |
| ----------- | ---------- | -------- | --------------------------- |
| breakpoints | 自定义断点 | number[] | [576, 768, 992, 1200, 1600] |

### RowSlots

继承 [Row Slots](https://element-plus.org/zh-CN/component/layout.html#row-slots)。

### ColProps

继承 [Col Attributes](https://element-plus.org/zh-CN/component/layout.html#col-attributes)。

### ColSlots

继承 [Col Slots](https://element-plus.org/zh-CN/component/layout.html#col-slots)。
