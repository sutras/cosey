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

const onRowMove = ({ from, to }: { from: number; to: number }) => {
  ElMessage.success(`已从第 ${from + 1} 行移动到第 ${to + 1} 行，记得把顺序提交到服务端`);
};
</script>
