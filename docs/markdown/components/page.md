# Page 页面骨架

## 简介

页面级容器：标题、描述、返回按钮、右侧操作区与内容区都有固定位置，避免每个页面各写一套标题栏。

## 代码演示

### 基础使用

::: demo

page/basic

:::

### 返回按钮

`back` 传 `true` 返回上一页，传字符串跳转到指定路由，也可以传函数自定义行为：

```vue
<co-page title="用户详情" back> ... </co-page>
<co-page title="用户详情" back="/users"> ... </co-page>
```

## API

### CoPageProps

| 属性        | 描述                                        | 类型                             | 默认值 |
| ----------- | ------------------------------------------- | -------------------------------- | ------ |
| title       | 标题                                        | string                           | -      |
| description | 标题下方的描述                              | string                           | -      |
| back        | 返回：`true` 上一页 / 路由地址 / 自定义函数 | boolean \| string \| (() => any) | false  |
| border      | 标题区下边框                                | boolean                          | true   |
| ghost       | 去掉内边距，适合嵌在卡片内部                | boolean                          | false  |

### CoPageSlots

| 插槽        | 描述                   | 属性 |
| ----------- | ---------------------- | ---- |
| default     | 内容区                 | -    |
| title       | 自定义标题             | -    |
| description | 自定义描述             | -    |
| actions     | 标题右侧的主要操作     | -    |
| extra       | 标题区最右侧的附加内容 | -    |
| footer      | 底部操作区             | -    |

### CoPageEmits

| 事件 | 描述               | 类型       |
| ---- | ------------------ | ---------- |
| back | 点击返回按钮时触发 | () => void |
