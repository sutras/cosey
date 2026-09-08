<template>
  <co-container full-page>
    <co-table v-bind="tableProps">
      <template #toolbar-left>
        <el-button v-if="can('create', 'user')" type="primary" @click="upsert.add()">
          {{ t('common.add') }}
        </el-button>
        <el-button
          v-if="can('update', 'user')"
          type="primary"
          @click="onBatchSilent(t('user.confirmMute'), 1)"
        >
          {{ t('user.batchMute') }}
        </el-button>
        <el-button
          v-if="can('update', 'user')"
          type="primary"
          @click="onBatchSilent(t('user.confirmUnmute'), 0)"
        >
          {{ t('user.batchUnmute') }}
        </el-button>
      </template>
      <template #action="{ row }">
        <co-table-action
          :actions="[
            {
              hidden: cannot('update', 'user'),
              label: t('common.edit'),
              icon: 'bi bi-pencil-square',
              onClick: () => {
                upsert.edit(row);
              },
            },
            {
              hidden: cannot('delete', 'user'),
              label: t('common.delete'),
              icon: 'bi bi-trash3',
              type: 'danger',
              popconfirm: {
                title: t('common.confirmDelete'),
                confirm: () => onDelete(row.id),
              },
            },
          ]"
        />
      </template>
    </co-table>

    <UserUpsert :ref="upsert.ref" />
  </co-container>
</template>

<script lang="tsx" setup>
import { ElMessage } from 'element-plus';
import usersApi from '@/api/users';
import UserUpsert from './user-upsert.vue';
import { useOuterUpsert } from 'cosey/hooks';
import { useTable } from 'cosey/components';
import * as mock from '@gunny/mock';
import { useAbility } from '@casl/vue';
import { warningConfirm } from 'cosey/utils';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

const { t } = useI18n();

defineOptions({
  name: 'Users',
});

const { can, cannot } = useAbility();

const { getUsers, deleteUser, updateUser, updateBulkSilent } = usersApi;

const [tableProps, { reload, getSelectionRows }] = useTable(
  computed(() => ({
    api: getUsers,
    columns: [
      { type: 'selection' },
      { prop: 'id', label: 'ID' },
      { prop: 'nickname', label: t('user.nickname') },
      {
        label: t('user.contact'),
        columns: [
          { prop: 'name', label: t('user.name') },
          { prop: 'mobile', label: t('user.phone') },
          { prop: 'address', label: t('user.address'), renderer: 'longtext', minWidth: 120 },
        ],
      },
      { prop: 'gender', label: t('user.gender') },
      {
        prop: 'silent',
        label: t('user.mute'),
        renderer: {
          type: 'switch',
          api: (value, row) =>
            updateUser(row.id, { silent: value }).then(() => {
              reload();
            }),
          props: { activeValue: 1, inactiveValue: 0 },
        },
      },
      { prop: 'birthday', label: t('user.birthday'), renderer: 'date', sortable: 'custom' },
      { prop: 'constellation', label: t('user.zodiac') },
      { prop: 'height', label: t('user.height'), sortable: 'custom' },
      { prop: 'weight', label: t('user.weight'), sortable: 'custom' },
      { prop: 'avatar', label: t('user.avatar'), renderer: 'media' },
      { prop: 'qualification', label: t('user.education') },
      { prop: 'trait', label: t('user.traits') },
      { prop: 'friendshipType', label: t('user.datingType') },
      { prop: 'hobbies', label: t('user.hobbies'), renderer: 'tag' },
      { prop: 'signature', label: t('user.signature') },
      { prop: 'createdAt', label: t('common.creationTime'), renderer: 'datetime' },
      { prop: 'updatedAt', label: t('common.updateTime'), renderer: 'datetime' },
    ],
    formProps: {
      schemes: [
        { prop: 'nickname', label: t('user.nickname') },
        { prop: 'mobile', label: t('user.phone') },
        { prop: 'name', label: t('user.name') },
        {
          prop: 'gender',
          label: t('user.gender'),
          fieldType: 'select',
          fieldProps: { options: mock.genders },
        },
        { prop: 'birthday', label: t('user.birthday'), fieldType: 'daterange' },
        {
          prop: 'silent',
          label: t('user.mute'),
          fieldType: 'select',
          fieldProps: {
            options: [
              { label: t('common.yes'), value: 1 },
              { label: t('common.no'), value: 0 },
            ],
          },
        },
      ],
    },
    actionColumn: {
      label: t('common.actions'),
      slots: 'action',
      fixed: 'right',
      minWidth: 150,
    },
    height: '100%',
  })),
);

const upsert = useOuterUpsert({
  success() {
    reload();
  },
});

const onDelete = async (id: number) => {
  return deleteUser(id).then(() => {
    ElMessage.success(t('common.deleteSuccess'));
    reload();
  });
};

const onBatchSilent = (message: string, value: number) => {
  const ids = getSelectionRows().map((item: any) => item.id);
  if (ids.length === 0) {
    ElMessage(t('common.pleaseSelect'));
  } else {
    warningConfirm(message).then(() =>
      updateBulkSilent({
        ids,
        value,
      }).then(() => {
        ElMessage.success(t('common.operationSuccess'));
        reload();
      }),
    );
  }
};
</script>
