<template>
  <co-card-tabs v-model="range" title="营收概览" tab-type="segment">
    <template #extra>09:40 更新</template>

    <co-card-tab-panel
      v-for="item in ranges"
      :key="item.name"
      :name="item.name"
      :label="item.label"
    >
      <div class="metrics">
        <div v-for="metric in item.metrics" :key="metric.label" class="metric">
          <div class="value">{{ metric.value }}</div>
          <div class="label">{{ metric.label }}</div>
        </div>
      </div>
    </co-card-tab-panel>
  </co-card-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const range = ref('30d');

const ranges = [
  {
    name: '7d',
    label: '近 7 天',
    metrics: [
      { label: '销售额', value: '¥ 318,900' },
      { label: '订单数', value: '1,204' },
      { label: '客单价', value: '¥ 265' },
    ],
  },
  {
    name: '30d',
    label: '近 30 天',
    metrics: [
      { label: '销售额', value: '¥ 1,286,400' },
      { label: '订单数', value: '4,982' },
      { label: '客单价', value: '¥ 258' },
    ],
  },
  {
    name: '90d',
    label: '近 90 天',
    metrics: [
      { label: '销售额', value: '¥ 3,904,200' },
      { label: '订单数', value: '15,120' },
      { label: '客单价', value: '¥ 258' },
    ],
  },
];
</script>

<style scoped>
.metrics {
  display: flex;
  gap: 48px;
}

.value {
  font-size: 22px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-variant-numeric: tabular-nums;
}

.label {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
