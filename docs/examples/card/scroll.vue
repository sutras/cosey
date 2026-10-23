<template>
  <div class="stack">
    <co-card title="最大高度" max-height="160px">
      <p v-for="i in 12" :key="i" class="line">第 {{ i }} 行</p>
    </co-card>

    <co-card title="固定高度" height="120px">
      <p v-for="i in 12" :key="i" class="line">第 {{ i }} 行</p>
    </co-card>
  </div>
</template>

<script lang="ts" setup></script>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.line {
  margin: 0;
  padding-block: 4px;
  border-block-end: 1px dashed var(--el-border-color-lighter);
}
</style>
