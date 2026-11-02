<template>
  <div class="wrap">
    <co-card size="small" title="我的待办" class="todo-card">
      <div v-for="todo in todos" :key="todo.label" class="todo">
        <span>{{ todo.label }}</span>
        <el-tag size="small" effect="plain" :type="todo.type">{{ todo.count }}</el-tag>
      </div>
    </co-card>

    <div class="entries">
      <co-card v-for="entry in entries" :key="entry.label" variant="borderless" hoverable>
        <div class="entry">
          <span class="entry-name">{{ entry.label }}</span>
          <span class="entry-desc">{{ entry.desc }}</span>
        </div>
      </co-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
const todos = [
  { label: '待审批采购单', count: 3, type: 'warning' as const },
  { label: '待发货订单', count: 12, type: 'primary' as const },
  { label: '待处理工单', count: 5, type: 'danger' as const },
];

const entries = [
  { label: '我的订单', desc: '查看与售后' },
  { label: '发票管理', desc: '开票与下载' },
  { label: '团队成员', desc: '12 人' },
  { label: '接口密钥', desc: '2 个有效' },
];
</script>

<style scoped>
.wrap {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.todo-card {
  width: 220px;
  flex: none;
}

.todo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-block: 6px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.entries {
  display: grid;
  flex: 1;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.entry {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.entry-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.entry-desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
