# Card 卡片

## 简介

内容区块容器：标题、副标题、右上角操作区与折叠能力，可选边框、阴影与浮起效果。

## 代码演示

### 基础使用

::: demo

card/basic

:::

### 标题、折叠与内嵌

`type` 为 `inner` 时只把标题区底色加深，边框与整体背景都与普通卡片一致，用于在外层卡片内部区分「头部 / 主体」。

::: demo

card/header

:::

### 内容区滚动

`height` 固定内容区高度，`max-height` 限制最大高度；两者都作用于内容区并**包含内边距**，超出后内部滚动。

::: demo

card/scroll

:::

## API

### CardProps

| 属性        | 描述                                                               | 类型                          | 默认值     |
| ----------- | ------------------------------------------------------------------ | ----------------------------- | ---------- |
| size        | 尺寸                                                               | `medium` \| `small`           | `medium`   |
| variant     | 形态                                                               | `outlined` \| `borderless`    | `outlined` |
| hoverable   | 鼠标移入时浮起                                                     | boolean                       | false      |
| title       | 卡片标题                                                           | string                        | -          |
| sub-title   | 卡片副标题                                                         | string                        | -          |
| type        | 卡片类型，`inner` 为内嵌卡片（标题区带底色、无边框）               | `inner`                       | -          |
| collapsible | 折叠方式：`icon` 右侧图标 / `header` 整块标题区 / `false` 不可折叠 | boolean \| `icon` \| `header` | false      |
| collapsed   | 是否折叠，配合 `v-model:collapsed`                                 | boolean                       | false      |
| tooltip     | 标题右侧的提示说明                                                 | string                        | -          |
| box-shadow  | 显示阴影                                                           | boolean                       | false      |
| height      | 内容区固定高度，超出后内部滚动（含内边距）                         | string \| number              | -          |
| max-height  | 内容区最大高度，超出后内部滚动（含内边距）                         | string \| number              | -          |

### CardSlots

| 插槽     | 描述         | 属性 |
| -------- | ------------ | ---- |
| default  | 内容         | -    |
| title    | 自定义标题   | -    |
| subTitle | 自定义副标题 | -    |
| extra    | 右上角操作区 | -    |

### CardEmits

| 事件             | 描述         | 类型                         |
| ---------------- | ------------ | ---------------------------- |
| click            | 点击时触发   | (event: MouseEvent) => void  |
| update:collapsed | 折叠状态变化 | (collapsed: boolean) => void |

## 说明

`collapsible` 默认是 `icon`，但只有卡片存在标题区（`title` / `sub-title` / `tooltip` / `extra` / 对应插槽）时才会渲染折叠按钮；没有标题区的卡片不会出现折叠入口。

需要「固定高度 + 内部滚动」的分区时用 `height` / `max-height`，原来独立的 `co-panel` 已合并到本组件。
