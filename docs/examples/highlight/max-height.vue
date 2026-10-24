<template>
  <div class="stack">
    <p class="label">max-height="180px"：超出后内部滚动，复制按钮固定在右上角</p>
    <co-highlight :code="code" lang="ts" max-height="180px" />
  </div>
</template>

<script lang="ts" setup>
const code = `export interface TableColumn {
  key: string;
  title: string;
  width?: number;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  sortable?: boolean;
  ellipsis?: boolean;
}

export const columns: TableColumn[] = [
  { key: 'name', title: '名称', minWidth: 160 },
  { key: 'status', title: '状态', width: 96, align: 'center' },
  { key: 'owner', title: '负责人', width: 120 },
  { key: 'createdAt', title: '创建时间', width: 168, sortable: true },
  { key: 'updatedAt', title: '更新时间', width: 168, sortable: true },
  { key: 'remark', title: '备注', minWidth: 240, ellipsis: true },
];

export const defaultSort = {
  field: 'createdAt',
  order: 'desc' as const,
};`;
</script>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.label {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
