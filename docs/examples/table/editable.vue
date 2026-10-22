<template>
  <co-table
    :columns="columns"
    :data="rows"
    :pagination="false"
    :toolbar-config="false"
    height="320px"
    @cell-change="onCellChange"
  />
</template>

<script lang="tsx" setup>
import { TableColumnProps } from 'cosey/components';
import { ElMessage } from 'element-plus';
import { ref } from 'vue';

const rows = ref([
  { id: 1, name: '张三', status: 1, score: 88 },
  { id: 2, name: '李四', status: 0, score: 76 },
]);

const columns: TableColumnProps[] = [
  { prop: 'name', label: '姓名', editable: true },
  {
    prop: 'status',
    label: '状态',
    editable: {
      type: 'select',
      props: {
        options: [
          { value: 1, label: '启用' },
          { value: 0, label: '禁用' },
        ],
      },
    },
  },
  { prop: 'score', label: '评分', editable: { type: 'number', props: { min: 0, max: 100 } } },
];

const onCellChange = ({ row, prop, value }: any) => {
  ElMessage.info(`第 ${row.id} 行 ${prop} 改为 ${value}`);
};
</script>
