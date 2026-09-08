<template>
  <co-container full-page>
    <co-table v-bind="tableProps">
      <template #toolbar-left>
        <el-button v-if="can('create', 'system_enum')" type="primary" @click="upsert.add()">
          {{ t('common.add') }}
        </el-button>
      </template>
      <template #action="{ row }">
        <co-table-action
          :actions="[
            {
              hidden: cannot('read', 'system_enum_item'),
              label: t('enum.enumItem'),
              icon: 'bi bi-list-ul',
              onClick: () => {
                enumItemsRef?.open(row.id);
              },
            },
            {
              hidden: cannot('update', 'system_enum'),
              label: t('common.edit'),
              icon: 'bi bi-pencil-square',
              onClick: () => {
                upsert.edit(row);
              },
            },
            {
              hidden: cannot('delete', 'system_enum'),
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

    <Upsert :ref="upsert.ref" />

    <EnumItems ref="enumItems" />
  </co-container>
</template>

<script lang="tsx" setup>
import { ElMessage } from 'element-plus';
import enumsApi from '@/api/system/enums';
import Upsert from './enum-upsert.vue';
import { useOuterUpsert } from 'cosey/hooks';
import { useTable } from 'cosey/components';
import EnumItems from '../enum-items/index.vue';
import { computed, useTemplateRef } from 'vue';
import { useAbility } from '@casl/vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineOptions({
  name: 'SystemEnums',
});

const { can, cannot } = useAbility();

const { getEnums, deleteEnum } = enumsApi;

const [tableProps, { reload }] = useTable(
  computed(() => ({
    api: getEnums,
    columns: [
      { prop: 'id', label: 'ID' },
      { prop: 'name', label: t('enum.name') },
      { prop: 'remark', label: t('enum.remark') },
      { prop: 'createdAt', label: t('common.creationTime'), renderer: 'datetime' },
      { prop: 'updatedAt', label: t('common.updateTime'), renderer: 'datetime' },
    ],
    actionColumn: {
      label: t('common.actions'),
      slots: 'action',
      fixed: 'right',
      minWidth: 220,
    },
    height: '100%',
    formProps: {
      schemes: [
        { prop: 'name', label: t('enum.name') },
        { prop: 'remark', label: t('enum.remark') },
      ],
    },
  })),
);

const upsert = useOuterUpsert({
  success() {
    reload();
  },
});

const onDelete = async (id: number) => {
  return deleteEnum(id).then(() => {
    ElMessage.success(t('common.deleteSuccess'));
    reload();
  });
};

const enumItemsRef = useTemplateRef('enumItems');
</script>
