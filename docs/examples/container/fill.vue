<template>
  <div class="viewport">
    <co-container fill scrollable title="撑满父容器" description="标题区常驻，内容区在内部滚动">
      <div v-for="i in 20" :key="i" class="line">第 {{ i }} 行内容</div>
    </co-container>
  </div>
</template>

<script lang="ts" setup></script>

<style scoped>
.viewport {
  background-color: var(--el-fill-color-light);
  height: 320px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}

.line {
  padding-block: 6px;
  border-block-end: 1px dashed var(--el-border-color-lighter);
}
</style>
