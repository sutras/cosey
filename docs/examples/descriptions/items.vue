<template>
  <co-descriptions title="用户信息" bordered :column="2" :items="items" />
</template>

<script lang="ts" setup>
import type { DescriptionsItemData } from 'cosey';

const items: DescriptionsItemData[] = [
  { label: '用户 ID', content: '1000' },
  { label: '昵称', content: '张三' },
  { label: '注册时间', content: '2025-10-20' },
  { label: '状态', content: '正常' },
  {
    label: '备注',
    span: 2,
    content: '与插槽写法等价，适合字段由配置生成时使用。',
    contentStyle: { color: 'var(--el-text-color-secondary)' },
  },
];
</script>
