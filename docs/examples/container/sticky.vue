<template>
  <div class="viewport">
    <co-container :sticky="0" title="吸顶标题" description="页面滚动时标题区固定在顶部">
      <div v-for="i in 20" :key="i" class="line">第 {{ i }} 行内容</div>
    </co-container>
  </div>
</template>

<script lang="ts" setup></script>

<style scoped>
.viewport {
  background-color: var(--el-fill-color-light);
  height: 260px;
  overflow: auto;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}

.line {
  padding-block: 6px;
  border-block-end: 1px dashed var(--el-border-color-lighter);
}
</style>
