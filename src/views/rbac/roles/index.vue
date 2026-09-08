<template>
  <co-container full-page>
    <co-table v-bind="tableProps">
      <template #toolbar-left>
        <el-button v-if="can('create', 'rbac_role')" type="primary" @click="roleUpsert.add()">
          {{ t('common.add') }}
        </el-button>
      </template>
      <template #action="{ row }">
        <co-table-action
          :actions="[
            {
              hidden: cannot('update', 'rbac_role'),
              label: t('rbac.permission'),
              icon: 'bi bi-clipboard2-check',
              onClick: () => {
                permissionsUpsert.edit(row);
              },
            },
            {
              hidden: cannot('update', 'rbac_role'),
              label: t('common.edit'),
              icon: 'bi bi-pencil-square',
              onClick: () => {
                roleUpsert.edit(row);
              },
            },
            {
              hidden: cannot('delete', 'rbac_role'),
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

    <RoleUpsert :ref="roleUpsert.ref" />
    <PermissionsUpsert :ref="permissionsUpsert.ref" />
  </co-container>
</template>

<script lang="tsx" setup>
import { ElMessage } from 'element-plus';
import rolesApi from '@/api/rbac/roles';
import { useOuterUpsert } from 'cosey/hooks';
import { useTable } from 'cosey/components';
import PermissionsUpsert from './permissions-upsert.vue';
import RoleUpsert from './role-upsert.vue';
import { useAbility } from '@casl/vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineOptions({
  name: 'RbacRoles',
});

const { can, cannot } = useAbility();

const { deleteRole, getRoles } = rolesApi;

const [tableProps, { reload }] = useTable(
  computed(() => ({
    api: getRoles,
    columns: [
      { prop: 'id', label: 'ID' },
      { prop: 'name', label: t('rbac.roleName') },
      { prop: 'createdAt', label: t('common.creationTime'), renderer: 'datetime' },
      { prop: 'updatedAt', label: t('common.updateTime'), renderer: 'datetime' },
    ],
    actionColumn: {
      label: t('common.actions'),
      slots: 'action',
      minWidth: 200,
      fixed: 'right',
    },
    height: '100%',
  })),
);

const roleUpsert = useOuterUpsert({
  success() {
    reload();
  },
});

const permissionsUpsert = useOuterUpsert({
  success() {
    reload();
  },
});

const onDelete = async (id: number) => {
  return deleteRole(id).then(() => {
    ElMessage.success(t('common.deleteSuccess'));
    reload();
  });
};
</script>
