<template>
  <co-table :columns="columns" :data="rows" :pagination="false" :toolbar-config="false" />
</template>

<script lang="tsx" setup>
import { TableColumnProps } from 'cosey/components';

const rows = [
  { id: 1, name: '张伟', contact: { mobile: '138****2210' }, mobile: '', remark: '' },
  { id: 2, name: '李娜', contact: { mobile: '' }, mobile: '139****8866', remark: '工作日送货' },
  { id: 3, name: '王强', contact: { mobile: '' }, mobile: '', remark: '' },
];

const columns: TableColumnProps[] = [
  { prop: 'name', label: '客户', width: 120 },
  {
    prop: 'remark',
    label: '备注（未配置）',
    minWidth: 160,
  },
  {
    prop: 'remark',
    label: '备注（empty）',
    minWidth: 160,
    renderer: { empty: '—' },
  },
  {
    prop: 'contact.mobile',
    label: '联系电话（fallback）',
    minWidth: 180,
    renderer: { fallback: ['mobile'], empty: '未填写' },
  },
];
</script>
