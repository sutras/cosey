<template>
  <div class="stack">
    <co-input-number-range
      v-model="value"
      start-placeholder="最小值"
      end-placeholder="最大值"
      @change="onChange"
    />

    <p class="state">
      当前值：
      <code>{{ display }}</code>
    </p>
    <p class="hint">填反了（开始 &gt; 结束）不会边输入边跳，离开组件后自动交换成「小 - 大」。</p>
    <p class="hint">已触发 change {{ changed }} 次</p>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';

const value = ref<number[]>();

const changed = ref(0);

const display = computed(() => (value.value ? value.value.join(' - ') : '未完成'));

const onChange = () => {
  changed.value += 1;
};
</script>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  max-width: 320px;
}

.state {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.hint {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}
</style>
