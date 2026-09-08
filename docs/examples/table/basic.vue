<template>
  <co-table v-bind="tableProps">
    <template #toolbar-left>
      <el-button type="primary" @click="onAdd()">新增</el-button>
    </template>
    <template #action="{ row }">
      <co-table-action
        :actions="[
          {
            label: '编辑',
            icon: 'bi bi-pencil-square',
            onClick: () => {
              onEdit(row);
            },
          },
          {
            label: '删除',
            icon: 'bi bi-trash3',
            type: 'danger',
            popconfirm: {
              title: '确定删除？',
              confirm: () => onDelete(row.id),
            },
          },
        ]"
      />
    </template>
  </co-table>
</template>

<script lang="tsx" setup>
import { ElMessage } from 'element-plus';
import * as mock from '@gunny/mock';
import { useTable } from 'cosey/components';
import usersApi from '@/api/users';

const { getUsers, deleteUser } = usersApi;

const [tableProps, { reload }] = useTable({
  height: '600px',
  api: getUsers,
  columns: [
    { prop: 'id', label: 'ID' },
    { prop: 'nickname', label: '昵称' },
    {
      label: '联系方式',
      columns: [
        { prop: 'name', label: '姓名' },
        { prop: 'mobile', label: '手机号' },
        { prop: 'address', label: '地址', renderer: 'longtext', minWidth: 120 },
      ],
    },
    { prop: 'gender', label: '性别' },
    { prop: 'birthday', label: '生日', renderer: 'date', sortable: 'custom' },
    { prop: 'constellation', label: '星座' },
    { prop: 'height', label: '身高(cm)', sortable: 'custom' },
    { prop: 'weight', label: '体重(kg)', sortable: 'custom' },
    { prop: 'qualification', label: '学历' },
    { prop: 'avatar', label: '头像', renderer: 'media' },
    { prop: 'trait', label: '特质' },
    { prop: 'friendshipType', label: '交友类型' },
    { prop: 'hobbies', label: '爱好', renderer: 'tag' },
    { prop: 'signature', label: '个性签名' },
    { prop: 'createdAt', label: '创建时间', renderer: 'datetime' },
    { prop: 'updatedAt', label: '更新时间', renderer: 'datetime' },
  ],
  actionColumn: {
    label: '操作',
    slots: 'action',
    fixed: 'right',
    minWidth: 150,
  },
  formProps: {
    schemes: [
      { label: '昵称', prop: 'nickname' },
      { prop: 'mobile', label: '手机号' },
      { prop: 'name', label: '姓名' },
      {
        prop: 'gender',
        label: '性别',
        modelValue: '女',
        fieldType: 'select',
        fieldProps: { options: mock.genders },
      },
      { prop: 'birthday', label: '生日', fieldType: 'daterange' },
    ],
  },
});

const onAdd = () => {
  ElMessage.info('新增数据');
};

const onEdit = (row: any) => {
  ElMessage.info(`编辑id为 ${row.id}`);
};

const onDelete = async (id: number) => {
  return deleteUser(id).then(() => {
    ElMessage.success('删除成功');
    reload();
  });
};
</script>
