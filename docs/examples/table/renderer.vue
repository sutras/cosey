<template>
  <co-table :columns="columns" :data="rows" :pagination="false" :toolbar-config="false" />
</template>

<script lang="tsx" setup>
import { ElMessage } from 'element-plus';
import { TableColumnProps } from 'cosey/components';

const rows = [
  {
    id: 'SO1101-001',
    status: 'paid',
    urgent: 1,
    address:
      '广东省深圳市南山区科技园南区 8 栋 12 楼 1203 室（工作日 9:00-18:00 收货，到楼下请先电话联系）',
    paidAt: '2024-11-01 09:24:00',
    notify: true,
  },
  {
    id: 'SO1101-002',
    status: 'shipping',
    urgent: 0,
    address: '杭州市余杭区文一西路 969 号 5 号楼 3 层',
    paidAt: '2024-11-01 11:02:00',
    notify: false,
  },
  {
    id: 'SO1102-003',
    status: 'closed',
    urgent: 0,
    address: '北京市朝阳区望京东路 4 号院 2 号楼 B 座 18 层前台代收',
    paidAt: '2024-11-02 15:41:00',
    notify: true,
  },
];

const statusOptions = [
  { value: 'paid', label: '已付款', tag: 'success' as const },
  { value: 'shipping', label: '发货中', tag: 'warning' as const },
  { value: 'closed', label: '已关闭', tag: 'info' as const },
];

const columns: TableColumnProps[] = [
  {
    prop: 'id',
    label: '订单号',
    renderer: {
      type: 'click',
      onClick: ({ value }) => ElMessage.info(`查看订单 ${value}`),
    },
  },
  { prop: 'status', label: '状态', renderer: { type: 'tag', options: statusOptions } },
  {
    prop: 'urgent',
    label: '发货要求',
    width: 140,
    renderer: { type: 'boolean', trueText: '加急', falseText: '普通', trueTag: 'danger' },
  },
  { prop: 'address', label: '收货地址', renderer: 'longtext' },
  { prop: 'paidAt', label: '付款时间', renderer: 'datetime' },
  {
    prop: 'notify',
    label: '到货通知',
    renderer: {
      type: 'switch',
      api: async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
      },
    },
  },
];
</script>
