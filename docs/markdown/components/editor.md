# Editor 编辑器

## 简介

富文本编辑器，预设了常用样式与块级菜单，开箱即用。

图片上传依赖于 `launch api.upload` 接口，需要保证接口返回一个文件地址。

编辑器能用的功能（`features`）与工具栏显示的按钮（`toolbar`）都可以裁剪，两者都是逗号分隔的字符串；
功能没开启时，对应的键盘快捷键也一并失效。

光标进入表格单元格后，表格上方会浮出工具条，支持行列增删、合并与拆分、表头切换、
单元格底色与对齐、拖拽调整列宽，`Tab` / 方向键可在单元格间移动。表格格式会随 `v-model`
的值一起保存，下次渲染时自动还原。

工具条的「字体颜色」只作用于选中的文字，表格工具条里的「单元格文字颜色」是单元格级默认色（空单元格也生效、可框选批量设置），两者叠加时以字体颜色为准；「清除格式」只作用于文字内容，单元格底色与字色请用表格工具条的「清除」按钮。

## 代码演示

### 基础使用

使用 `v-model` 双向绑定编辑器值。

::: demo

editor/basic

:::

### 表单验证

`Editor` 组件接入了 `element-plus` 表单验证逻辑，使其可以像 `element-plus` 表单组件一样使用。

::: demo

editor/validate

:::

### 浮动工具栏

通过 `mode="float"` 切换到浮动工具栏，适合空间有限的场景：选中文本后浮出「行内样式」工具条（末尾的「更多」可展开全部操作）；鼠标移入编辑器时，当前块的左侧浮出「+」入口按钮，点击弹出块级样式的多级菜单。

::: demo

editor/float

:::

### 自定义工具栏按钮

通过 `toolbar` 指定固定工具栏显示哪些按钮、怎么分组：`,` 分隔按钮，`|` 分隔按钮组。

::: demo

editor/toolbar

:::

### 自定义可用功能

通过 `features` 指定编辑器能用哪些功能。未启用的功能不会出现在任何工具栏里，浮动工具栏与块级菜单同样受它约束，
对应的键盘快捷键也一并失效 —— 例如没开 `bold`，除了没有加粗按钮，`⌘/Ctrl + B` 也不会生效。

::: demo

editor/features

:::

### 调用编辑器方法

组件实例上暴露了格式化与插入方法，可以在外部触发，例如往光标处插入一段文本。

::: demo

editor/expose

:::

## API

### EditorProps

| 属性                  | 描述                                                                                             | 类型                | 默认值             |
| --------------------- | ------------------------------------------------------------------------------------------------ | ------------------- | ------------------ |
| model-value (v-model) | 编辑器当前值                                                                                     | string              | -                  |
| placeholder           | 编辑器占位文本                                                                                   | string              | -                  |
| height                | 编辑器高度                                                                                       | string              | -                  |
| max-height            | 编辑器最大高度                                                                                   | string              | -                  |
| readonly              | 是否只读                                                                                         | boolean             | false              |
| disabled              | 是否禁用                                                                                         | boolean             | false              |
| mode                  | 工具栏展示形态，`static` 固定工具栏 / `float` 浮动工具栏                                         | 'static' \| 'float' | static             |
| toolbar               | 固定工具栏展示的按钮，`,` 分隔按钮、`\|` 分隔按钮组；传不含有效按钮的值（如 `none`）即隐藏工具栏 | string              | 全部按钮的预设分组 |
| features              | 编辑器可使用的功能，`,` 分隔，取值见[功能与按钮](#功能与按钮)；不配置表示不限制                  | string              | -                  |

### EditorEmits

| 事件              | 描述               | 类型                    |
| ----------------- | ------------------ | ----------------------- |
| update:modelValue | 编辑器值改变时触发 | (value: string) => void |
| change            | 编辑器值改变时触发 | (value: string) => void |

### EditorExpose

通过组件 ref 拿到的实例方法，可在外部触发格式化、插入与查询。
`toggleMark` 的 `name` 取值为 `bold` / `italic` / `underline` / `strikethrough` / `code` / `superscript` / `subscript`。

#### 文本

| 方法             | 描述                                     | 返回值  |
| ---------------- | ---------------------------------------- | ------- |
| focus()          | 让编辑器获得焦点                         | -       |
| insertText(text) | 在光标处插入纯文本，有选区时替换选区内容 | -       |
| getContent()     | 取当前内容，空文档返回空串               | string  |
| setContent(html) | 用 HTML 覆盖整个文档（不进撤销历史）     | -       |
| serialize()      | 序列化当前文档为 HTML                    | string  |
| isDocEmpty()     | 文档是否为空                             | boolean |
| hasTool(tool)    | 某个功能是否可用（由 `features` 决定）   | boolean |

#### 历史

| 方法      | 描述         | 返回值  |
| --------- | ------------ | ------- |
| undo()    | 撤销         | -       |
| redo()    | 重做         | -       |
| canUndo() | 是否可以撤销 | boolean |
| canRedo() | 是否可以重做 | boolean |

#### 行内样式

| 方法                             | 描述                                                                        | 返回值  |
| -------------------------------- | --------------------------------------------------------------------------- | ------- |
| toggleMark(name)                 | 切换行内样式                                                                | -       |
| isMarkActive(name)               | 当前选区是否已应用某个行内样式                                              | boolean |
| getTextStyleValue(key)           | 取当前选区的文字样式，`key` 取值为 `font` / `size` / `color` / `background` | string  |
| formatFont(value)                | 设置字体                                                                    | -       |
| formatSize(value)                | 设置字号                                                                    | -       |
| formatSizeDelta(delta, callback) | 按步长增减字号，回调收到调整后的字号                                        | -       |
| formatColor(color)               | 设置文字颜色，不传表示清除                                                  | -       |
| formatBackground(color)          | 设置文字背景色，不传表示清除                                                | -       |

#### 块级样式

| 方法                   | 描述                                     | 返回值                |
| ---------------------- | ---------------------------------------- | --------------------- |
| formatHeading(value)   | 设置段落类型，传入当前类型会退回正文     | -                     |
| getActiveHeadingType() | 取光标所在段落的类型                     | HeadingParagraphType  |
| formatAlign(value)     | 设置对齐方式，重复调用当前对齐会取消对齐 | -                     |
| isAlignActive(value)   | 某个对齐方式是否已生效                   | boolean               |
| formatIndent(delta)    | 增减缩进层级，`-1` 减少 / `+1` 增加      | -                     |
| formatList(type)       | 切换列表，再调用当前列表类型会取消列表   | -                     |
| getListType()          | 取光标所在列表的类型                     | ListType \| undefined |
| formatBlockQuote()     | 切换引用                                 | -                     |
| isBlockQuoteActive()   | 光标是否在引用里                         | boolean               |
| formatCodeBlock()      | 切换代码块                               | -                     |
| isCodeBlockActive()    | 光标是否在代码块里                       | boolean               |
| clearFormats()         | 清除选区的所有行内样式与块级样式         | -                     |

#### 链接

| 方法                          | 描述                                             | 返回值                          |
| ----------------------------- | ------------------------------------------------ | ------------------------------- |
| formatLink(url, target, text) | 给选区添加链接；选区为空时会插入 `text` 并链接它 | -                               |
| unwrapLink()                  | 去掉当前选区所在的整个链接                       | -                               |
| isLinkActive()                | 当前选区是否在链接里                             | boolean                         |
| getLinkAttrs()                | 取当前选区的链接信息                             | \{ url, target, text \} \| null |

#### 插入

| 方法                                                  | 描述                                    | 返回值                      |
| ----------------------------------------------------- | --------------------------------------- | --------------------------- |
| insertImage(url, file, width, height)                 | 插入图片，传 `file` 时会走上传流程      | -                           |
| insertVideo(url, width, height)                       | 插入视频                                | -                           |
| insertFormula(value)                                  | 插入公式；光标在公式上时改为更新它      | -                           |
| insertTable(rows, columns)                            | 插入表格，并在表格后补一个可落脚的段落  | -                           |
| updateImage(attrs) / updateVideo(attrs)               | 更新图片 / 视频节点的属性               | -                           |
| isImageActive() / isVideoActive() / isFormulaActive() | 光标是否在对应节点上                    | boolean                     |
| getImageAttrs() / getVideoAttrs() / getFormulaAttrs() | 取对应节点的属性，不在节点上返回 `null` | Record<string, any> \| null |

#### 表格

| 方法                                                          | 描述                                        | 返回值                   |
| ------------------------------------------------------------- | ------------------------------------------- | ------------------------ |
| insertRowAbove() / insertRowBelow()                           | 在上方 / 下方插入行                         | -                        |
| deleteRow()                                                   | 删除当前行                                  | -                        |
| insertColumnLeft() / insertColumnRight()                      | 在左侧 / 右侧插入列                         | -                        |
| deleteColumn()                                                | 删除当前列                                  | -                        |
| deleteTable()                                                 | 删除整张表格                                | -                        |
| mergeCells()                                                  | 合并框选的多个单元格，选区不是矩形时不执行  | -                        |
| splitCell()                                                   | 拆分合并过的单元格                          | -                        |
| toggleHeaderRow() / toggleHeaderColumn() / toggleHeaderCell() | 切换行 / 列 / 单元格表头                    | -                        |
| setCellBackground(color)                                      | 设置单元格底色，不传表示清除                | -                        |
| setCellColor(color)                                           | 设置单元格默认文字色，不传表示清除          | -                        |
| setCellVerticalAlign(value)                                   | 设置单元格垂直对齐，不传表示清除            | -                        |
| moveRowUp() / moveRowDown()                                   | 上移 / 下移当前行                           | -                        |
| moveColumnLeft() / moveColumnRight()                          | 左移 / 右移当前列                           | -                        |
| isInTable()                                                   | 光标是否在表格里                            | boolean                  |
| getTableState()                                               | 取当前表格的状态快照，不在表格里返回 `null` | EditorTableState \| null |

### 功能与按钮

`features` 与 `toolbar` 使用同一套 key。`features` 里的功能没开启时，`toolbar` 里即使配了对应按钮也不会出现；
`toolbar` 里没配的按钮不会显示在固定工具栏上，但仍可通过[实例方法](#editorexpose)调用。

| key             | 分类 | 说明             |
| --------------- | ---- | ---------------- |
| undo            | 历史 | 撤销             |
| redo            | 历史 | 重做             |
| heading         | 块级 | 段落类型（标题） |
| ordered-list    | 块级 | 有序列表         |
| bulleted-list   | 块级 | 无序列表         |
| indent-decrease | 块级 | 减少缩进         |
| indent-increase | 块级 | 增加缩进         |
| align-left      | 块级 | 左对齐           |
| align-center    | 块级 | 居中对齐         |
| align-right     | 块级 | 右对齐           |
| align-justify   | 块级 | 两端对齐         |
| blockquote      | 块级 | 引用             |
| code-block      | 块级 | 代码块           |
| bold            | 行内 | 加粗             |
| italic          | 行内 | 斜体             |
| underline       | 行内 | 下划线           |
| strikethrough   | 行内 | 删除线           |
| code            | 行内 | 行内代码         |
| superscript     | 行内 | 上标             |
| subscript       | 行内 | 下标             |
| font            | 行内 | 字体             |
| size            | 行内 | 字号             |
| color           | 行内 | 文字颜色         |
| background      | 行内 | 文字背景色       |
| link            | 行内 | 链接             |
| image           | 插入 | 图片             |
| video           | 插入 | 视频             |
| table           | 插入 | 表格             |
| formula         | 插入 | 公式             |
| clear           | 其他 | 清除格式         |
| source          | 其他 | 源码模式         |

内置快捷键如下，对照的都是上表里的 key —— 功能没开启时按键同样不生效：

| 快捷键              | 对应功能                         |
| ------------------- | -------------------------------- |
| `⌘/Ctrl + Z`        | undo                             |
| `⌘/Ctrl + Y`、`⇧⌘Z` | redo                             |
| `⌘/Ctrl + B`        | bold                             |
| `⌘/Ctrl + I`        | italic                           |
| `⌘/Ctrl + U`        | underline                        |
| `Tab`、`⇧Tab`       | indent-increase、indent-decrease |

退格、回车、全选、方向键这些编辑操作不属于功能开关的范围，任何配置下都可用。
`Tab` 在表格里是切换到相邻单元格（属 `table`），只有在表格之外才是缩进。
