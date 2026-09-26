<template>
  <div>
    <div style="margin-bottom: 12px">
      <span>显示「编辑」按钮：</span>
      <el-switch v-model="editable" />
      <span style="margin-left: 16px">按钮分割线：</span>
      <el-switch v-model="divider" />
    </div>

    <co-table v-bind="tableProps" />
  </div>
</template>

<script lang="tsx" setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useTable } from 'cosey/components';
import usersApi from '@/api/users';

const { getUsers, deleteUser } = usersApi;

const editable = ref(true);
const divider = ref(true);

// 整份配置写成 getter：`divider` 这类列属性变化时才会重算
const [tableProps, { reload }] = useTable(() => ({
  api: getUsers,
  height: '500px',
  columns: [
    { prop: 'id', label: 'ID' },
    { prop: 'nickname', label: '昵称' },
    { prop: 'gender', label: '性别' },
    { prop: 'mobile', label: '手机号' },
    { prop: 'createdAt', label: '创建时间', renderer: 'datetime' },
  ],
  actionColumn: {
    label: '操作',
    fixed: 'right',
    minWidth: 210,
    divider: divider.value,
    // 工厂在每次渲染时求值：能拿到当前行，读到的响应式值也会跟着变
    actions: (row) => [
      {
        visible: editable.value,
        label: '编辑',
        icon: 'bi bi-pencil',
        onClick: () => {
          ElMessage.info(`编辑 id 为 ${row.id} 的数据`);
        },
      },
      {
        label: '删除',
        icon: 'bi bi-trash',
        type: 'danger',
        popconfirm: {
          title: `确定删除「${row.nickname}」？`,
          confirm: () => deleteUser(row.id).then(reload),
        },
      },
      {
        label: '更多',
        icon: 'bi bi-three-dots',
        dropdown: [
          { label: '复制 ID', onClick: () => ElMessage.success(`已复制 ${row.id}`) },
          { label: '查看详情', onClick: () => ElMessage.info(`id 为 ${row.id} 的数据`) },
        ],
      },
    ],
  },
}));
</script>
