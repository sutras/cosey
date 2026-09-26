<template>
  <div>
    <div style="margin-bottom: 12px">
      <el-button @click="onPreset">只看女生</el-button>
      <el-button @click="onClear">清空筛选</el-button>
      <el-tag type="info" style="margin-left: 8px">
        model.gender：{{ model.gender ?? '未设置' }}
      </el-tag>
    </div>

    <co-table v-bind="tableProps" />
  </div>
</template>

<script lang="tsx" setup>
import { useTable } from 'cosey/components';
import usersApi from '@/api/users';

const { getUsers } = usersApi;

interface UserQuery {
  nickname: string;
  gender?: string;
}

const [tableProps, { model, submit }] = useTable<UserQuery>({
  api: getUsers,
  height: '500px',
  columns: [
    { prop: 'id', label: 'ID' },
    { prop: 'nickname', label: '昵称' },
    { prop: 'gender', label: '性别' },
    { prop: 'mobile', label: '手机号' },
    { prop: 'avatar', label: '头像', renderer: 'media' },
    { prop: 'createdAt', label: '创建时间', renderer: 'datetime' },
  ],
  // 工厂形态能拿到筛选模型；工厂内部读到的响应式值也会被表格收集
  formSchemes: () => [
    // 各项的 `modelValue` 就是该筛选字段的初值（`urlFields` 里声明过的字段即使不写也会自动补齐）
    { prop: 'nickname', label: '昵称', modelValue: '' },
    {
      prop: 'gender',
      label: '性别',
      fieldType: 'select',
      fieldProps: {
        clearable: true,
        options: [
          { label: '男', value: '男' },
          { label: '女', value: '女' },
        ],
      },
    },
  ],
});

// 表格之外也能直接读写筛选模型：改完调用 submit() 重新查询
const onPreset = () => {
  model.gender = '女';
  submit();
};

const onClear = () => {
  model.gender = undefined;
  submit();
};
</script>
