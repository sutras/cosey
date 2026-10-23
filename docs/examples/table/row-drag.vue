<template>
  <co-table
    :columns="columns"
    :data="rows"
    :pagination="false"
    table-key="demo-sortable-user"
    row-draggable
    height="320px"
    @row-move="onRowMove"
  />
</template>

<script lang="tsx" setup>
import { ElMessage } from 'element-plus';
import { ref } from 'vue';

const rows = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' },
]);

const columns = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '姓名' },
];

const onRowMove = ({ rows }: { from: number; to: number; rows: { name: string }[] }) => {
  ElMessage.success(`顺序已更新：${rows.map((row) => row.name).join(' → ')}，记得提交到服务端`);
};
</script>
