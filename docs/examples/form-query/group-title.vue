<template>
  <co-form-query
    :schemes="schemes"
    :groups="groups"
    :grid="false"
    inline
    label-width="auto"
    width="200px"
    group-layout="left"
    :group-title-width="120"
    :collapsed="false"
  >
    <template #group-title="{ group }">
      <el-tag size="small" type="primary">{{ group.label }}</el-tag>
    </template>
  </co-form-query>
</template>

<script lang="ts" setup>
import type { FormQueryGroup, FormQueryScheme } from 'cosey/components';

const groups: FormQueryGroup[] = [
  { name: 'basic', label: '基本信息' },
  { name: 'trade', label: '交易信息' },
  { name: 'logistics', label: '物流信息' },
];

const schemes: FormQueryScheme[] = [
  { prop: 'keyword', label: '关键词', group: 'basic', modelValue: '' },
  {
    prop: 'status',
    label: '状态',
    group: 'basic',
    fieldType: 'select',
    fieldProps: {
      clearable: true,
      options: [
        { label: '启用', value: '1' },
        { label: '禁用', value: '0' },
      ],
    },
  },
  { prop: 'createdAt', label: '下单时间', group: 'trade', fieldType: 'daterange' },
  { prop: 'amountMin', label: '最小金额', group: 'trade', fieldType: 'number' },
  {
    prop: 'region',
    label: '收货地区',
    group: 'logistics',
    fieldType: 'select',
    fieldProps: {
      options: [
        { label: '华东', value: 'east' },
        { label: '华南', value: 'south' },
      ],
    },
  },
  { prop: 'remark', label: '备注', group: 'logistics', modelValue: '' },
];
</script>
