# Descriptions 描述列表

## 简介

成组展示多个字段，常用于详情页、订单卡片等只需要「看」不需要「改」的场景：按列数自动排布、支持跨列、边框与纵向两种排布方式。

字段用 `co-descriptions-item` 声明，每个子项的 `label` 是标签、默认插槽是内容；字段由配置生成时也可以直接用 `items` 属性。

## 代码演示

### 基础使用

`title` 与 `extra` 插槽构成标题区，`column` 决定每行放几个子项，末行不满时最后一个子项自动铺满。`tooltip` 会在标题右侧加一个提示图标，鼠标移入显示说明；子项上也有同名属性，图标出现在标签右侧。

::: demo

descriptions/basic

:::

### 边框

`bordered` 给整个表加外框，标签列带底色；边框模式下不显示冒号。

::: demo

descriptions/bordered

:::

### 跨列与列数

子项的 `span` 占多列，超过剩余列数时会被裁到本行末尾，不会撑破表格。

::: demo

descriptions/span

:::

### 响应式列数

`column` 也可以按断点声明，没命中的断点向更小的断点回落。列数按**容器自身宽度**计算，放进侧栏、弹窗或窄卡片时会自动减少列数，与页面整体宽度无关。

::: demo

descriptions/responsive

:::

### 标签在上

`layout` 为 `vertical` 时标签单独占一行、内容在下一行；仍然按 `column` 分列。

::: demo

descriptions/vertical

:::

### 尺寸

`large` / `medium` / `small` 只影响单元格间距，默认 `medium`。切换下方的边框开关，可以看到有边框时上下内边距的差异更明显。

::: demo

descriptions/size

:::

### 数据方式

`items` 与插槽写法等价，`label-style`、`content-style` 可以整体给标签列、内容列设样式，子项上的同名字段优先级更高。

::: demo

descriptions/items

:::

## API

### DescriptionsProps

| 属性          | 描述                             | 类型                                                                               | 默认值     |
| ------------- | -------------------------------- | ---------------------------------------------------------------------------------- | ---------- |
| title         | 标题                             | string                                                                             | -          |
| tooltip       | 标题右侧的提示说明               | string                                                                             | -          |
| extra         | 标题右侧的附加内容               | string                                                                             | -          |
| column        | 列数，可按断点声明               | number \| `Partial<Record<'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'xxl', number>>` | 1 / 2 / 3  |
| bordered      | 显示边框                         | boolean                                                                            | false      |
| layout        | 排列方向                         | `horizontal` \| `vertical`                                                         | horizontal |
| size          | 尺寸                             | `large` \| `medium` \| `small`                                                     | medium     |
| colon         | 标签后追加冒号（边框模式不显示） | boolean                                                                            | true       |
| label-align   | 标签对齐方式                     | `left` \| `center` \| `right`                                                      | left       |
| label-style   | 标签列样式                       | CSSProperties                                                                      | -          |
| content-style | 内容列样式                       | CSSProperties                                                                      | -          |
| items         | 数据方式声明子项                 | DescriptionsItemData[]                                                             | -          |

`column` 不传时按断点取 1 / 2 / 3：容器宽度小于 576 时 1 列、小于 768 时 2 列、再宽则 3 列。

### DescriptionsItemProps

| 属性          | 描述               | 类型            | 默认值 |
| ------------- | ------------------ | --------------- | ------ |
| label         | 标签               | string \| VNode | -      |
| tooltip       | 标签右侧的提示说明 | string          | -      |
| span          | 占用的列数         | number          | 1      |
| label-style   | 标签单元格样式     | CSSProperties   | -      |
| content-style | 内容单元格样式     | CSSProperties   | -      |

默认插槽为内容。

### DescriptionsSlots

| 插槽    | 描述         | 属性 |
| ------- | ------------ | ---- |
| default | 子项         | -    |
| title   | 自定义标题   | -    |
| extra   | 标题右侧内容 | -    |

### DescriptionsItemData

| 属性         | 描述                    | 类型             |
| ------------ | ----------------------- | ---------------- |
| key          | 唯一标识                | string \| number |
| label        | 标签                    | VNodeChild       |
| tooltip      | 标签右侧的提示说明      | string           |
| content      | 内容，也可用 `children` | VNodeChild       |
| span         | 占用的列数              | number           |
| labelStyle   | 标签单元格样式          | CSSProperties    |
| contentStyle | 内容单元格样式          | CSSProperties    |
| class        | 单元格类名              | string           |
| style        | 单元格行内样式          | CSSProperties    |
