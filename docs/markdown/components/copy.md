# Copy 复制

## 简介

点击复制文本的图标按钮，复制成功后图标变成绿色对勾（两个状态尺寸一致，不会引起布局跳动）。

## 代码演示

### 基础使用

通过 `text` 属性指定要复制的文本。

::: demo

copy/basic

:::

### 类型

`type` 设置图标颜色，可选 `primary` / `success` / `warning` / `danger` / `info`；需要任意色值时用 `color`。

::: demo

copy/type

:::

## API

### CopyProps

| 属性  | 描述                             | 类型                                                      | 默认值 |
| ----- | -------------------------------- | --------------------------------------------------------- | ------ |
| text  | 要复制的文本                     | string                                                    | -      |
| type  | 图标颜色                         | `primary` \| `success` \| `warning` \| `danger` \| `info` | -      |
| color | 直接指定颜色（优先级更高）       | string                                                    | -      |
| label | 无障碍标签，默认取语言包「复制」 | string                                                    | -      |
