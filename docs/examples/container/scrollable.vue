<template>
  <co-container scrollable :mobile-adaptive="false" :short-adaptive="false" class="box">
    <div v-for="i in 12" :key="i" class="line">第 {{ i }} 行</div>
  </co-container>
</template>

<script lang="ts" setup></script>

<style scoped>
.box {
  background-color: var(--el-fill-color-light);
  height: 180px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}

.line {
  padding-block: 4px;
  border-block-end: 1px dashed var(--el-border-color-lighter);
}
</style>
