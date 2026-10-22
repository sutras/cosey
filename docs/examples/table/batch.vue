<template>
  <co-table
    :columns="columns"
    :data="rows"
    :pagination="false"
    :batch="true"
    :toolbar-config="false"
    height="360px"
    row-key="id"
  >
    <template #batch="{ count, clear }">
      <el-button size="small" text type="primary" @click="clear">取消选择</el-button>
      <el-button size="small" text type="danger" @click="onBatchDelete(count, clear)">
        批量删除
      </el-button>
    </template>
  </co-table>
</template>

<script lang="tsx" setup>
import { ElMessage } from 'element-plus';
import { ref } from 'vue';

const rows = ref([
  { id: 1, name: '张三', age: 28 },
  { id: 2, name: '李四', age: 32 },
  { id: 3, name: '王五', age: 24 },
]);

const columns = [
  { type: 'selection' },
  { prop: 'name', label: '姓名' },
  { prop: 'age', label: '年龄' },
];

const onBatchDelete = (count: number, clear: () => void) => {
  ElMessage.success(`已删除 ${count} 行`);
  clear();
};
</script>
