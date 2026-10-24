<template>
  <div class="stack">
    <div class="block">
      <p class="label">禁用</p>
      <co-input-number-range v-model="disabledValue" disabled :min="0" :max="100" />
    </div>

    <div class="block">
      <p class="label">只读</p>
      <co-input-number-range v-model="readonlyValue" readonly :min="0" :max="100" />
    </div>

    <div class="block">
      <p class="label">只填了一端：值保持 undefined</p>
      <co-input-number-range v-model="halfValue" :min="0" :max="100" start-placeholder="最小值" />
      <p class="state">
        modelValue：
        <code>{{ String(halfValue) }}</code>
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const disabledValue = ref<number[]>([10, 60]);

const readonlyValue = ref<number[]>([20, 80]);

const halfValue = ref<number[]>();
</script>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  max-width: 320px;
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
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--el-text-color-regular);
}
</style>
