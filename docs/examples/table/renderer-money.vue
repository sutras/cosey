<template>
  <co-table :columns="columns" :data="rows" :pagination="false" :toolbar-config="false" />
</template>

<script lang="tsx" setup>
import { TableColumnProps } from 'cosey/components';

const rows = [
  { id: 'INV-2401', amount: 1280, feeCent: 3840, amountCny: 9200 },
  { id: 'INV-2402', amount: -99.5, feeCent: -299, amountCny: -715.6 },
  { id: 'INV-2403', amount: 0, feeCent: 0, amountCny: 0 },
];

const columns: TableColumnProps[] = [
  { prop: 'id', label: '账单号', width: 120 },
  { prop: 'amount', label: '成交价（美元）', width: 132, align: 'right', renderer: 'usd' },
  {
    prop: 'feeCent',
    label: '平台服务费（美分）',
    width: 156,
    align: 'right',
    renderer: 'cent',
  },
  {
    prop: 'amountCny',
    label: '折合人民币',
    width: 132,
    align: 'right',
    renderer: { type: 'cny', props: { precision: 2 } },
  },
];
</script>
