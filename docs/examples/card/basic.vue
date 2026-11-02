<template>
  <co-card>
    <div class="greeting">
      <el-avatar :size="44" class="avatar">张</el-avatar>

      <div class="text">
        <div class="title">早上好，张明</div>
        <div class="desc">今天有 3 个待审批的采购单、2 条新的系统通知。</div>
      </div>

      <el-button type="primary" plain>去处理</el-button>
    </div>
  </co-card>
</template>

<script lang="ts" setup></script>

<style scoped>
.greeting {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  flex: none;
  font-size: 16px;
  background-color: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
}

.text {
  flex: 1;
  min-width: 0;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.desc {
  margin-top: 4px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}
</style>
