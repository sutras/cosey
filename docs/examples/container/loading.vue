<template>
  <div class="stack">
    <el-switch v-model="loading" active-text="加载态" />

    <div class="demo-canvas">
      <co-container
        title="用户详情"
        description="加载中时标题与描述显示为骨架条"
        :loading="loading"
        back
      >
        内容区由使用方自己决定是否加载中
      </co-container>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const loading = ref(true);
</script>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
