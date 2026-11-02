# Card 卡片

## 简介

内容区块容器：标题、副标题、操作区、页脚与折叠能力，可选边框、阴影与浮起效果。

## 代码演示

### 基础使用

工作台顶部的问候卡：只有内容区，没有标题区，也不带外框以外的装饰。

::: demo

card/basic

:::

### 标题、副标题与操作区

`title` / `sub-title` 组成标题区，`extra` 插槽放右侧的时间切换、导出这类操作，`tooltip` 在标题后补一个说明图标。指标卡、报表卡都是这个结构。

::: demo

card/header

:::

### 折叠

`collapsible="header"` 时整个标题区都可以点，`collapsible`（或 `icon`）只点右侧箭头；`v-model:collapsed` 可以把折叠状态交给外部控制。适合筛选条、设置面板这类默认收起更省地方的区域。

::: demo

card/collapse

:::

### 内嵌分区

外层卡片里再套 `type="inner"` 的卡片做二级分区，标题区带底色区分层级。订单详情、工单详情这种「主信息 + 若干附属块」的结构用它。

::: demo

card/inner

:::

### 尺寸与形态

`size="small"` 用于侧栏、抽屉这类紧凑容器；`variant="borderless"` 去掉外框，配 `hoverable` 做可点击的入口块。

::: demo

card/variant

:::

### 页脚与自定义样式

`footer` 属性或 `footer` 插槽给卡片补一块页脚，放提交人、金额、操作按钮这类收尾信息。页脚在折叠区域之外，卡片收起时仍然可见可点。

`header-class` / `body-class` / `footer-class` 与对应的 `*-style` 分别作用在三个区域上，做告警、选中态这类整块着色时不用再包一层容器。

::: demo

card/footer

:::

### 内容区滚动

内容区常驻 `overflow: auto`：根元素高度被限制（直接给 `height` / `max-height`，或由父级布局决定）时内部滚动，否则由内容撑开。

::: demo

card/scroll

:::

## API

### CardProps

| 属性         | 描述                                                               | 类型                          | 默认值     |
| ------------ | ------------------------------------------------------------------ | ----------------------------- | ---------- |
| size         | 尺寸                                                               | `medium` \| `small`           | `medium`   |
| variant      | 形态                                                               | `outlined` \| `borderless`    | `outlined` |
| hoverable    | 鼠标移入时浮起                                                     | boolean                       | false      |
| title        | 卡片标题                                                           | string                        | -          |
| sub-title    | 卡片副标题                                                         | string                        | -          |
| footer       | 卡片页脚，`footer` 插槽优先                                        | string                        | -          |
| type         | 卡片类型，`inner` 为内嵌卡片（标题区带底色、无边框）               | `inner`                       | -          |
| collapsible  | 折叠方式：`icon` 右侧图标 / `header` 整块标题区 / `false` 不可折叠 | boolean \| `icon` \| `header` | false      |
| collapsed    | 是否折叠，配合 `v-model:collapsed`                                 | boolean                       | false      |
| tooltip      | 标题右侧的提示说明                                                 | string                        | -          |
| box-shadow   | 显示阴影                                                           | boolean                       | false      |
| header-class | 标题区的额外类名                                                   | string \| array \| object     | -          |
| header-style | 标题区的额外样式                                                   | CSSProperties                 | -          |
| body-class   | 内容区的额外类名                                                   | string \| array \| object     | -          |
| body-style   | 内容区的额外样式（`height` / `flex` / `overflow` 由折叠动画接管）  | CSSProperties                 | -          |
| footer-class | 页脚的额外类名                                                     | string \| array \| object     | -          |
| footer-style | 页脚的额外样式                                                     | CSSProperties                 | -          |

### CardSlots

| 插槽     | 描述                                       | 属性 |
| -------- | ------------------------------------------ | ---- |
| default  | 内容                                       | -    |
| header   | 整块替换标题区内容（折叠按钮仍由卡片渲染） | -    |
| title    | 自定义标题                                 | -    |
| subTitle | 自定义副标题                               | -    |
| extra    | 右上角操作区                               | -    |
| footer   | 自定义页脚                                 | -    |

### CardEmits

| 事件             | 描述         | 类型                         |
| ---------------- | ------------ | ---------------------------- |
| click            | 点击时触发   | (event: MouseEvent) => void  |
| update:collapsed | 折叠状态变化 | (collapsed: boolean) => void |

## 说明

`collapsible` 默认是 `icon`，但只有卡片存在标题区（`title` / `sub-title` / `tooltip` / `extra` / 对应插槽）时才会渲染折叠按钮；没有标题区的卡片不会出现折叠入口。

需要「固定高度 + 内部滚动」的分区，直接给卡片根元素限制高度（`height` / `max-height`，或在 flex 布局里让父级决定），内容区会自己滚动；原来独立的 `co-panel` 已合并到本组件。
