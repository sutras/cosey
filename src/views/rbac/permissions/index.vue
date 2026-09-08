<template>
  <co-container full-page>
    <co-table v-bind="tableProps">
      <template #toolbar-left>
        <el-button-group class="me-4">
          <el-button @click="expandAll()">{{ t('common.expandAll') }}</el-button>
          <el-button @click="collapseAll()">{{ t('common.collapseAll') }}</el-button>
        </el-button-group>
        <el-button v-if="can('create', 'rbac_permission')" type="primary" @click="upsert.add()">
          {{ t('common.add') }}
        </el-button>
      </template>
      <template #action="{ row }">
        <co-table-action
          :actions="[
            {
              hidden: cannot('update', 'rbac_permission'),
              label: t('common.edit'),
              icon: 'bi bi-pencil-square',
              onClick: () => {
                upsert.edit(row);
              },
            },
            {
              hidden: cannot('delete', 'rbac_permission'),
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

    <PermissionUpsert :ref="upsert.ref" />
  </co-container>
</template>

<script lang="tsx" setup>
import PermissionUpsert from './permission-upsert.vue';
import { useOuterUpsert } from 'cosey/hooks';
import { useTable } from 'cosey/components';
import { ElMessage } from 'element-plus';
import permissionsApi from '@/api/rbac/permissions';
import { reactive } from 'vue';
import { useAbility } from '@casl/vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineOptions({
  name: 'RbacPermissions',
});

const { can, cannot } = useAbility();

const { deletePermission, getPermissionTree } = permissionsApi;

const [tableProps, { reload, expandAll, collapseAll }] = useTable(
  reactive({
    api: getPermissionTree,
    keys: {
      list: '',
    },
    rowKey: 'id',
    columns: [
      { prop: 'name', label: t('rbac.name'), minWidth: 200 },
      { prop: 'subject', label: t('rbac.resource'), minWidth: 180 },
      { prop: 'action', label: t('rbac.action') },
      { prop: 'conditions', label: t('rbac.condition') },
      { prop: 'order', label: t('common.sort') },
    ],
    actionColumn: {
      label: t('common.actions'),
      slots: 'action',
      fixed: 'right',
      minWidth: 140,
    },
    height: '100%',
    pagination: false,
  }),
);

const upsert = useOuterUpsert({
  success() {
    reload();
  },
});

const onDelete = async (id: number) => {
  return deletePermission(id).then(() => {
    ElMessage.success(t('common.deleteSuccess'));
    reload();
  });
};
</script>
