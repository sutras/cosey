<template>
  <div class="demo-canvas stack">
    <co-container :padding="false" class="cell">
      <div class="inner">padding = false</div>
    </co-container>
    <co-container padding="sm" class="cell">
      <div class="inner">padding = "sm"</div>
    </co-container>
    <co-container class="cell">
      <div class="inner">默认</div>
    </co-container>
    <co-container padding="lg" class="cell">
      <div class="inner">padding = "lg"</div>
    </co-container>
  </div>
</template>

<script lang="ts" setup></script>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cell {
  border: 1px dashed var(--el-border-color);
  border-radius: 4px;
}

.inner {
  padding-block: 4px;
  text-align: center;
  background-color: var(--el-bg-color);
}
</style>
