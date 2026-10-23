# Container 容器

## 简介

带内边距的页面容器：可挂标题区、返回按钮与底部操作区，高度可设为一屏或撑满父容器，并把「内容区可用高度」提供给子组件。

## 代码演示

### 基础使用

::: demo

container/basic

:::

### 页面标题

`title` / `description` 生成标题区，`#actions` 放右侧操作，`back` 显示返回按钮。

::: demo

container/title

:::

### 充满屏幕

高度为视口高度减去头部导航高度，配合表格 `height: 100%` 可让分页始终贴在屏幕底部。示例区域限高 360px，实际高度是一整屏。

::: demo

container/full-page

:::

### 撑满父容器并内部滚动

`fill` 撑满父容器、`scrollable` 让内容区内部滚动，适合放进弹窗或固定高度的区域。

::: demo

container/fill

:::

### 标题区吸顶

`sticky` 传 `true` 时偏移量取头部导航高度，传数字则为自定义偏移。

::: demo

container/sticky

:::

### 加载态

`loading` 只作用于标题区，内容区由使用方自己控制（通常用 `co-async` 包一层）。

::: demo

container/loading

:::

### 内边距

`padding` 传 `false` 去掉内边距，传 `sm` / `md` / `lg` 使用预设档位，传数字为像素值。

::: demo

container/padding

:::

### 内容超出时内部滚动

`scrollable` 让内容在容器内部滚动，需要给容器一个确定高度。

::: demo

container/scrollable

:::

## 高度说明

| 用法        | 行为                                                       |
| ----------- | ---------------------------------------------------------- |
| 都不传      | 高度由内容撑开                                             |
| `full-page` | 视口高度减去头部导航高度                                   |
| `fill`      | `height: 100%`，撑满有确定高度的父级，适合嵌在卡片、弹窗里 |

`full-page` 在两种情况下会退回内容高度：视口宽度不超过 768px（`mobile-adaptive`），或视口高度不超过 800px（`short-adaptive`）。两者默认开启，传 `false` 关闭；`fill` 不受这两项影响。

## 标题区

满足任一条件时渲染标题区：`title`、`description`、`loading`、`back`，或传入 `title` / `description` / `actions` / `extra` 插槽。

- 有标题区时容器变成纵向 flex，内容包进 `.co-container__body`（内边距由 `padding` 决定），`scrollable` 也随之变成内容区内部滚动。
- 没有标题区时保持原来的单层结构，表格这类依赖 `height: 100%` 的内容不受影响。
- 标题输出 `role="heading"`，层级用 `heading-level` 调整。
- `sticky` 需要页面本身随窗口滚动才看得到效果；`full-page` + `scrollable` 时标题区天然常驻，不必再设 `sticky`。

## API

### ContainerProps

| 属性            | 描述                                                     | 类型                                      | 默认值 |
| --------------- | -------------------------------------------------------- | ----------------------------------------- | ------ |
| full-page       | 高度设为一屏：视口高度减去头部导航高度                   | boolean                                   | false  |
| fill            | 高度撑满父容器，父级需有确定高度                         | boolean                                   | false  |
| padding         | 内边距：`true` 默认 / `false` 关闭 / 数字像素 / 预设档位 | boolean \| number \| `sm` \| `md` \| `lg` | true   |
| max-width       | 内容区最大宽度，超出后居中                               | number \| string                          | -      |
| scrollable      | 内容超出时在容器内部滚动                                 | boolean                                   | false  |
| mobile-adaptive | 视口宽度不超过 768px 时退回内容高度                      | boolean                                   | true   |
| short-adaptive  | 视口高度不超过 800px 时退回内容高度                      | boolean                                   | true   |
| title           | 标题                                                     | string                                    | -      |
| description     | 标题下方的描述                                           | string                                    | -      |
| back            | 返回：`true` 上一页 / 路由地址 / 自定义函数              | boolean \| string \| (() => any)          | false  |
| border          | 标题区下边框                                             | boolean                                   | true   |
| sticky          | 标题区吸顶：`true` 用头部导航高度 / 数字为偏移像素       | boolean \| number                         | false  |
| heading-level   | 标题的语义层级                                           | number                                    | 1      |
| loading         | 标题区加载态，标题与描述显示为骨架条                     | boolean                                   | false  |

### ContainerSlots

| 插槽        | 描述                   | 属性 |
| ----------- | ---------------------- | ---- |
| default     | 内容区                 | -    |
| title       | 自定义标题             | -    |
| description | 自定义描述             | -    |
| actions     | 标题右侧的主要操作     | -    |
| extra       | 标题区最右侧的附加内容 | -    |
| footer      | 底部操作区             | -    |

### ContainerEmits

| 事件 | 描述               | 类型       |
| ---- | ------------------ | ---------- |
| back | 点击返回按钮时触发 | () => void |

### useContainer

子组件可以读取布局层提供的高度信息，用于自行计算高度：

```ts
import { useContainer } from 'cosey/components';

const context = useContainer();

context?.headerHeight; // 头部导航高度（px）
context?.contentHeight; // 内容区可用高度（px）
context?.height; // 'calc(100vh - 48px)'
```

没有 `co-config-provider` 时返回 `null`。
