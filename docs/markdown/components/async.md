# Async 异步状态

## 简介

把「加载中 / 空数据 / 出错 / 有数据」四种状态收在一处，省掉每个页面重复的 `v-loading`、`v-if="empty"` 和 `catch` 重试。默认带骨架屏、空状态和错误重试。

## 代码演示

### 基础使用

::: demo

async/basic

:::

### 配合 useFetch

`state` 直接接 `useFetch()` 的返回值，`data` 会透传给默认插槽：

```vue
<script setup lang="ts">
import { useFetch } from 'cosey';

const fetch = useFetch(getUsers);
</script>

<template>
  <co-async :state="fetch">
    <template #default="{ data }">
      <co-table :data="data" />
    </template>
  </co-async>
</template>
```

## API

### AsyncProps

| 属性      | 描述                                                                    | 类型              | 默认值   |
| --------- | ----------------------------------------------------------------------- | ----------------- | -------- |
| state     | `useFetch()` 的返回值，包含 `isFetching` / `data` / `error` / `execute` | object            | -        |
| loading   | 单独控制加载态，优先级高于 `state`                                      | boolean           | -        |
| error     | 单独控制错误，任意非空值都会显示错误态                                  | any               | -        |
| empty     | 单独控制空态；不传时按 `state.data` 是否为「空数组 / 空字符串」判断     | boolean           | -        |
| emptyText | 空态文案                                                                | string            | 暂无数据 |
| skeleton  | 骨架屏行数，`false` 关闭                                                | boolean \| number | 4        |
| delay     | 延迟多少毫秒才显示加载态，避免闪烁                                      | number            | 0        |
| retry     | 重试回调，不传时调用 `state.execute()`                                  | () => any         | -        |
| retryText | 重试按钮文案                                                            | string            | 刷新     |

### AsyncSlots

`#default` 收到的是完整的 `AsyncSlotProps`，可以按需取用：

| 插槽    | 描述           | 属性                                       |
| ------- | -------------- | ------------------------------------------ |
| default | 有数据时的内容 | `{ data, loading, error, isEmpty, retry }` |
| loading | 自定义加载态   | `{ retry }`                                |
| empty   | 自定义空态     | `{ retry }`                                |
| error   | 自定义错误态   | `{ error, retry }`                         |

`data` 的类型取决于 `state.data`；需要精确类型时可显式标注：

```ts
import type { AsyncSlotProps } from 'cosey';

type UserSlot = AsyncSlotProps<User[]>;
```

### CoAsyncEmits

| 事件  | 描述                     | 类型       |
| ----- | ------------------------ | ---------- |
| retry | 点击重试（或调用 retry） | () => void |
