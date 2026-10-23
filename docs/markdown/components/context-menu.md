# ContextMenu 上下文菜单

## 简介

在指定区域右键（或左键点击）弹出的操作菜单，支持图标、禁用项、分隔线、多级子菜单、当前项高亮与整行自定义内容；也可以按坐标或某个锚点元素打开。

## 代码演示

### 基础使用

用 `#reference` 放置触发元素，菜单项用 `co-context-menu-item` 声明。`icon` 决定左侧图标列（只要有一项带图标，整列都会对齐），`divided` 在项前加分隔线，`disabled` 置灰不可点；点击后把该项的 `command` 抛给 `@command`。

::: demo

context-menu/basic

:::

### 触发方式

`trigger` 默认 `contextmenu`（右键）；设为 `click` 后左键点击也能打开，适合做「更多操作」按钮。

::: demo

context-menu/click

:::

### 子菜单

`co-context-sub-menu` 可嵌套任意层，`divided`、`disabled` 与菜单项一致。

::: demo

context-menu/sub-menu

:::

### 手动打开

调用 `open(x, y)` 传入坐标，菜单出现在指定位置。

::: demo

context-menu/manual

:::

### 锚点定位

`trigger="manual"` 搭配 `virtual-ref` 可以让菜单贴着某个元素显示：`virtual-ref` 只需提供 `getBoundingClientRect`，菜单会跟着元素移动。`placement` 决定方向，`offset` 决定间距。

非模态场景建议同时把 `lock-scroll` 关掉——锁滚动会给页面补滚动条宽度并隐藏溢出，导致锚点坐标变化、菜单和元素一起跳一下。

::: demo

context-menu/anchor

:::

### 当前项高亮

给菜单项加 `active`，表示它是当前生效的选择（文字使用主色），常用于对齐方式、标题层级这类单选菜单。

::: demo

context-menu/active

:::

### 自定义内容

默认插槽会替换整行内容，`icon` 插槽替换左侧图标。需要连续操作时把 `close-on-select` 设为 `false`，点击项本身不会关闭菜单，交给内部控件自己决定何时关闭。

::: demo

context-menu/custom

:::

## API

### ContextMenuProps

| 属性        | 描述                                                                               | 类型                                   | 默认值      |
| ----------- | ---------------------------------------------------------------------------------- | -------------------------------------- | ----------- |
| disabled    | 是否禁用                                                                           | boolean                                | false       |
| trigger     | 触发方式：`contextmenu` 右键打开 / `click` 左键打开 / `manual` 由外部调用 `open()` | string                                 | contextmenu |
| virtual-ref | 定位菜单的虚拟引用元素（锚点），配合 `manual` / `click` 使用                       | `{ getBoundingClientRect(): DOMRect }` | -           |
| placement   | 菜单相对锚点的放置位置，仅 `virtual-ref` 定位时生效                                | string                                 | right-start |
| offset      | 菜单与锚点之间的偏移量（px）                                                       | number                                 | 0           |
| persistent  | 关闭时仅隐藏菜单不卸载内容（菜单项子树上挂有待交互浮层时开启）                     | boolean                                | false       |
| lock-scroll | 打开时锁定页面滚动；锚定在元素上的非模态菜单建议关闭                               | boolean                                | true        |

### ContextMenuSlots

| 插槽      | 描述                     | 属性 |
| --------- | ------------------------ | ---- |
| default   | 菜单内容                 | -    |
| reference | 触发菜单显示的 HTML 元素 | -    |

### ContextMenuEmits

| 事件    | 描述                                                  | 类型                 |
| ------- | ----------------------------------------------------- | -------------------- |
| command | 当菜单项被点击时触发，参数是菜单项 `command` 属性的值 | (value: any) => void |
| open    | 上下文菜单显示时触发                                  | () => void           |
| close   | 上下文菜单隐藏时触发                                  | () => void           |

### ContextMenuExpose

| 属性  | 描述           | 类型                             |
| ----- | -------------- | -------------------------------- |
| open  | 打开上下文菜单 | (x?: number, y?: number) => void |
| close | 关闭上下文菜单 | () => void                       |

不传坐标时使用 `virtual-ref` 锚点定位。

### ContextMenuItemProps

| 属性            | 描述                                                      | 类型               | 默认值 |
| --------------- | --------------------------------------------------------- | ------------------ | ------ |
| command         | 派发到 `command` 回调函数的指令参数                       | any                | -      |
| disabled        | 是否禁用                                                  | boolean            | false  |
| divided         | 是否显示分隔符                                            | boolean            | false  |
| icon            | 自定义图标                                                | string / Component | -      |
| title           | 菜单标题                                                  | string             | -      |
| close-on-select | 点击后是否关闭整个菜单（内嵌下拉/网格等浮层时设为 false） | boolean            | true   |
| active          | 是否为当前激活态（如当前选中的标题层级、列表类型）        | boolean            | false  |

### ContextMenuItemSlots

| 插槽    | 描述                                                        | 属性 |
| ------- | ----------------------------------------------------------- | ---- |
| default | 自定义菜单项内容（提供时替换 `title` 文字，可承载任意组件） | -    |
| icon    | 自定义图标（覆盖 `icon` prop，可放置任意图标组件）          | -    |

### ContextSubMenuProps

| 属性     | 描述           | 类型               | 默认值 |
| -------- | -------------- | ------------------ | ------ |
| disabled | 是否禁用       | boolean            | false  |
| divided  | 是否显示分隔符 | boolean            | false  |
| icon     | 自定义图标     | string / Component | -      |
| title    | 菜单标题       | string             | -      |

### ContextSubMenuSlots

| 插槽    | 描述                                               | 属性 |
| ------- | -------------------------------------------------- | ---- |
| default | 子菜单内容                                         | -    |
| icon    | 自定义图标（覆盖 `icon` prop，可放置任意图标组件） | -    |
