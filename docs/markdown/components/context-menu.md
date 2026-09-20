# ContextMenu 上下文菜单

## 简介

通过点击鼠标右键展示的菜单，菜单会在鼠标右下角展示。

## 代码演示

### 基础使用

使用 `#reference` 来放置触发元素。

::: demo

context-menu/basic

:::

### 手动触发

可调用 `open()` 方法并传递坐标来展示。

::: demo

context-menu/manual

:::

### 子菜单

支持任意层级的嵌套。

::: demo

context-menu/sub-menu

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
