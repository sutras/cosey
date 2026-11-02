<template>
  <co-card title="本月销售额" sub-title="较上月 +12.4%" tooltip="数据来自订单中心，每小时同步一次">
    <template #extra>
      <el-radio-group v-model="range" size="small">
        <el-radio-button value="week">近 7 天</el-radio-button>
        <el-radio-button value="month">近 30 天</el-radio-button>
      </el-radio-group>
    </template>

    <div class="metric">¥ {{ amount }}</div>
    <div class="hint">含税金额，已剔除退款订单</div>
  </co-card>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';

const range = ref('month');

const amount = computed(() => (range.value === 'month' ? '1,286,400' : '318,900'));
</script>

<style scoped>
.metric {
  font-size: 28px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--el-text-color-primary);
  font-variant-numeric: tabular-nums;
}

.hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
