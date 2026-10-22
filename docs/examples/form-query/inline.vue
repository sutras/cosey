<template>
  <co-form-query :schemes="schemes" :grid="false" inline :submit="onSubmit" />
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus';
import { type FormQueryScheme } from 'cosey/components';

const schemes: FormQueryScheme[] = [
  {
    prop: 'keyword',
    label: '关键词',
    fieldType: 'input',
    modelValue: '',
  },
  {
    prop: 'status',
    label: '状态',
    fieldType: 'select',
    modelValue: '1',
    fieldProps: {
      clearable: true,
      options: [
        { label: '启用', value: '1' },
        { label: '禁用', value: '0' },
      ],
    },
  },
  {
    prop: 'createdAt',
    label: '创建时间',
    fieldType: 'date',
  },
];

const onSubmit = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  ElMessage.success('已查询');
};
</script>
