# Typography 排版

## 简介

一组文本排版组件：`co-typography-title` 标题、`co-typography-text` 行内文本、`co-typography-paragraph` 段落，以及不限定标签的 `co-typography`。支持语义色、禁用、加粗/斜体/下划线/删除线/标记底色/行内代码、一键复制，以及按行数省略——真的超出时才加省略号，`expandable` 还能就地展开看全文。

## 代码演示

### 基础使用

`co-typography-text` 渲染 `<span>`，适合行内混排；`co-typography-paragraph` 渲染 `<div>`，适合成段文字。`type` 给语义色，`disabled` 置灰不可选。

::: demo

typography/basic

:::

### 标题

`co-typography-title` 用 `level` 切换 `h1`–`h5`，字号与行高按级别走，元素标签也是对应的标题标签。

::: demo

typography/title

:::

### 文本样式

`mark`、`code`、`underline`、`delete`、`strong`、`italic` 可以任意组合。

::: demo

typography/decoration

:::

### 一键复制

`copyable` 在文本后面加一个复制按钮，文案来自 `text` 或默认插槽里的纯文本；和省略一起用时，按钮排在省略号/展开按钮后面。

::: demo

typography/copyable

:::

### 按行数省略

`ellipsis` 传对象时按 `rows` 限制行数：组件会算出最后一行能放多少字，把「…展开」直接接在省略号后面，不额外占一行；`expandable` 展开后「收起」跟在正文末尾，内容不再截断。

::: demo

typography/ellipsis

:::

### 省略号位置

`symbolPosition` 控制省略号出现在开头、中间还是结尾：路径/文件名用 `head`（保留尾部），长 ID 用 `middle`（头尾各留一半），默认 `tail`。三个位置都可以配合 `expandable`，被省略时点「展开」看全文。

::: demo

typography/ellipsis-position

:::

### 更多省略配置

`ellipsis` 为 `true` 表示单行省略；`symbol` 换省略号；`expandText` / `collapseText` 换按钮文案。同一套配置对 `Text`、`Title`、`Paragraph` 都生效。

::: demo

typography/ellipsis-config

:::

## API

### TypographyProps

| 属性      | 描述                          | 类型                                              | 默认值 |
| --------- | ----------------------------- | ------------------------------------------------- | ------ |
| text      | 文本内容（也可用默认插槽）    | string                                            | -      |
| type      | 语义色                        | `secondary` \| `success` \| `warning` \| `danger` | -      |
| disabled  | 禁用态（置灰、不可选）        | boolean                                           | false  |
| mark      | 标记底色                      | boolean                                           | false  |
| code      | 行内代码样式                  | boolean                                           | false  |
| underline | 下划线                        | boolean                                           | false  |
| delete    | 删除线                        | boolean                                           | false  |
| strong    | 加粗                          | boolean                                           | false  |
| italic    | 斜体                          | boolean                                           | false  |
| copyable  | 显示复制按钮                  | boolean                                           | false  |
| ellipsis  | `true` 单行省略，或传省略配置 | boolean \| TypographyEllipsisConfig               | -      |

### TypographyTitleProps

| 属性  | 描述         | 类型   | 默认值 |
| ----- | ------------ | ------ | ------ |
| level | 标题级别 1-5 | number | 1      |

### TypographyParagraphProps

| 属性 | 描述       | 类型   | 默认值 |
| ---- | ---------- | ------ | ------ |
| tag  | 根元素标签 | string | div    |

其余属性继承 `TypographyProps`。

### TypographyEllipsisConfig

| 属性           | 描述                                   | 类型    | 默认值 |
| -------------- | -------------------------------------- | ------- | ------ |
| rows           | 最多显示几行                           | number  | 3      |
| expandable     | 被省略时可展开                         | boolean | false  |
| symbol         | 省略号字符                             | string  | …      |
| symbolPosition | 省略号位置：`head` / `middle` / `tail` | string  | tail   |
| expandText     | 展开按钮文案                           | string  | -      |
| collapseText   | 收起按钮文案                           | string  | -      |

用默认插槽放自定义内容时无法按字符裁剪，会退回 CSS 的行数截断，展开按钮也会落到下一行；需要完整的省略能力时请用 `text`。

### TypographyEmits

| 事件            | 描述                   | 类型                         |
| --------------- | ---------------------- | ---------------------------- |
| truncate-change | 文本是否被省略发生变化 | (truncated: boolean) => void |
| expand-change   | 展开状态发生变化       | (expanded: boolean) => void  |

### TypographySlots

| 插槽    | 描述     | 属性 |
| ------- | -------- | ---- |
| default | 文本内容 | -    |
