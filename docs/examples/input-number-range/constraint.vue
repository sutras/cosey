<template>
  <div class="stack">
    <div class="block">
      <p class="label">金额：0 ~ 99999.99，保留两位小数</p>
      <co-input-number-range
        v-model="price"
        :min="0"
        :max="99999.99"
        :step="0.01"
        :precision="2"
        start-placeholder="最低价"
        end-placeholder="最高价"
      />
    </div>

    <div class="block">
      <p class="label">折扣：0 ~ 100，只能按 10 递增（step-strictly）</p>
      <co-input-number-range
        v-model="discount"
        :min="0"
        :max="100"
        :step="10"
        step-strictly
        start-placeholder="0"
        end-placeholder="100"
      />
    </div>

    <p class="state">
      金额：
      <code>{{ price ? price.join(' - ') : '-' }}</code>
      ／ 折扣：
      <code>{{ discount ? discount.join(' - ') : '-' }}</code>
    </p>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const price = ref<number[]>([99.9, 999.99]);

const discount = ref<number[]>([20, 80]);
</script>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  max-width: 360px;
}

.block {
  width: 100%;
}

.label {
  margin: 0 0 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.state {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-regular);
}
</style>
