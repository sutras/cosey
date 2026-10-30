<template>
  <co-form-query
    :schemes="schemes"
    :grid="false"
    inline
    label-width="auto"
    width="200px"
    :collapsed="false"
    :submit="onSubmit"
  >
    <template #submit="{ submit, submitting }">
      <el-button type="primary" :loading="submitting" @click="() => submit()">
        <co-icon name="bi bi-search" class="btn-icon" />
        查询订单
      </el-button>
    </template>
    <template #reset="{ reset }">
      <el-button text @click="() => reset()">清空条件</el-button>
    </template>
  </co-form-query>
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus';
import type { FormQueryScheme } from 'cosey/components';

const schemes: FormQueryScheme[] = [
  { prop: 'keyword', label: '关键词', modelValue: '' },
  {
    prop: 'status',
    label: '状态',
    fieldType: 'select',
    fieldProps: {
      clearable: true,
      options: [
        { label: '启用', value: '1' },
        { label: '禁用', value: '0' },
      ],
    },
  },
  { prop: 'createdAt', label: '下单时间', fieldType: 'daterange' },
];

const onSubmit = () => {
  ElMessage.success('已查询');
};
</script>

<style scoped>
.btn-icon {
  margin-inline-end: 4px;
}
</style>
