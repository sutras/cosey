<template>
  <co-form-query :schemes="schemes" :grid="false" :min-fields="2" inline :submit="onSubmit" />
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
    modelValue: '',
    fieldProps: {
      clearable: true,
      options: [
        { label: '启用', value: '1' },
        { label: '禁用', value: '0' },
      ],
    },
  },
  {
    prop: 'owner',
    label: '负责人',
    fieldType: 'input',
  },
  {
    prop: 'createdAt',
    label: '创建时间',
    fieldType: 'date',
  },
  {
    prop: 'amount',
    label: '合同金额',
    fieldType: 'input',
  },
];

const onSubmit = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  ElMessage.success('已查询');
};
</script>
