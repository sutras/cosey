# Highlight 代码高亮

## 简介

把 [Prism](https://prismjs.com/) 封装成组件，内置复制按钮。支持 20 多种语言的语法着色、超长代码内部滚动，也可以把代码放进默认插槽。代码区字号固定 13px，不随外层字号变化。

## 代码演示

### 基础使用

`code` 设置代码内容，`lang` 设置语言，不传时按纯文本渲染。右上角是复制按钮，复制到的是原始代码。

::: demo

highlight/basic

:::

### 切换语言

`lang` 决定用哪套语法规则着色：`ts` / `js` / `tsx` / `jsx`、`css` / `scss` / `less`、`html` / `xml` / `svg`、`json` / `json5`、`bash` / `shell`、`sql`、`python`、`java`、`php`、`nginx`、`markdown`，以及 `text` / `plain` 等纯文本别名。传其它 Prism 语言名也可以，未注册时自动退回纯文本。

::: demo

highlight/lang

:::

### 限制高度

`max-height` 传带单位的字符串，超出后代码区内部滚动，复制按钮固定在右上角不跟着滚。

::: demo

highlight/max-height

:::

### 通过插槽传入

不传 `code` 时，默认插槽里的纯文本会被当作代码；两者都给时以 `code` 为准。

::: demo

highlight/slot

:::

## API

### HighlightProps

| 属性      | 描述                             | 类型   | 默认值 |
| --------- | -------------------------------- | ------ | ------ |
| code      | 要高亮的代码内容                 | string | -      |
| lang      | 代码语言，取值见上方「切换语言」 | string | 'text' |
| maxHeight | 代码区最大高度，超出滚动         | string | -      |

### HighlightSlots

| 插槽    | 描述                          | 属性 |
| ------- | ----------------------------- | ---- |
| default | 代码内容（`code` 为空时生效） | -    |
