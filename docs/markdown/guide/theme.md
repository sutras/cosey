# 主题

Cosey 提供了以设置组件属性的方式自定义主题。

可通过 `ConfigProvider` 组件 `theme` 属性设置主题色：

```vue
<template>
  <ConfigProvider
    :theme="{
      token: {
        colorPrimary: '#1677ff',
        colorSuccess: '#52c41a',
        colorWarning: '#faad14',
        colorError: '#ff4d4f',
      },
    }"
    #default="{ locale }"
  >
    <ElConfigProvider :locale="locale">
      <router-view></router-view>
    </ElConfigProvider>
  </ConfigProvider>
</template>

<script setup lang="ts">
import { ConfigProvider } from 'cosey/components';
import { ElConfigProvider } from 'element-plus';
</script>
```

设置了主题色后，其梯度色会自动生成。
