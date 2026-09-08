<template>
  <co-container full-page>
    <co-table v-bind="tableProps">
      <template #toolbar-left>
        <el-button v-if="can('create', 'rbac_user')" type="primary" @click="upsert.add()">
          {{ t('common.add') }}
        </el-button>
      </template>
      <template #action="{ row }">
        <co-table-action
          :actions="[
            {
              hidden: cannot('update', 'rbac_user'),
              label: t('common.edit'),
              icon: 'bi bi-pencil-square',
              onClick: () => {
                upsert.edit(row);
              },
            },
            {
              hidden: cannot('delete', 'rbac_user') || row.id === userStore.userInfo?.id,
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

    <AdminUpsert :ref="upsert.ref" />
  </co-container>
</template>

<script lang="tsx" setup>
import { ElMessage } from 'element-plus';
import AdminUpsert from './admin-upsert.vue';
import { useOuterUpsert } from 'cosey/hooks';
import { useUserStore } from 'cosey';
import { useTable } from 'cosey/components';
import { useAbility } from '@casl/vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import adminApi from '@/api/rbac/admins';

const { t } = useI18n();

defineOptions({
  name: 'RbacAdmins',
});

const { can, cannot } = useAbility();

const { getAdmins, deleteAdmin } = adminApi;

const userStore = useUserStore();

const [tableProps, { reload }] = useTable(
  computed(() => ({
    api: getAdmins,
    columns: [
      { prop: 'id', label: 'ID' },
      { prop: 'username', label: t('rbac.username') },
      { prop: 'nickname', label: t('rbac.nickname') },
      { prop: 'avatar', label: t('rbac.avatar'), renderer: 'media' },
      {
        prop: 'roles',
        label: t('rbac.role'),
        renderer: {
          type: 'tag',
          path: 'name',
        },
      },
      { prop: 'createdAt', label: t('common.creationTime'), renderer: 'datetime' },
      { prop: 'updatedAt', label: t('common.updateTime'), renderer: 'datetime' },
    ],
    actionColumn: {
      label: t('common.actions'),
      slots: 'action',
      fixed: 'right',
      minWidth: 140,
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
  return deleteAdmin(id).then(() => {
    ElMessage.success(t('common.deleteSuccess'));
    reload();
  });
};
</script>
