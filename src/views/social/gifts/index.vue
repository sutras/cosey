<template>
  <co-container full-page>
    <co-table v-bind="tableProps">
      <template #toolbar-left>
        <el-button v-if="can('create', 'social_gift')" type="primary" @click="upsert.add()">
          {{ t('common.add') }}
        </el-button>
      </template>
    </co-table>

    <GiftUpsert :ref="upsert.ref" />
  </co-container>
</template>

<script lang="tsx" setup>
import { ElMessage } from 'element-plus';
import socialApi from '@/api/social';
import GiftUpsert from './gift-upsert.vue';
import { useOuterUpsert } from 'cosey/hooks';
import { useTable } from 'cosey/components';
import type { FormQueryScheme } from 'cosey/components';
import { useAbility } from '@casl/vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineOptions({
  name: 'SocialGifts',
});

const { can, cannot } = useAbility();

const { getGifts, updateGift, deleteGift } = socialApi;

const [tableProps, { reload }] = useTable(() => ({
  api: getGifts,
  columns: [
    { prop: 'id', label: 'ID', width: 80 },
    { prop: 'icon', label: t('social.icon'), renderer: 'media' },
    { prop: 'name', label: t('social.name'), minWidth: 120 },
    { prop: 'price', label: t('social.price'), sortable: 'custom', minWidth: 100 },
    { prop: 'charm', label: t('social.charm'), sortable: 'custom', minWidth: 100 },
    { prop: 'description', label: t('social.description'), minWidth: 220 },
    {
      prop: 'status',
      label: t('social.status'),
      width: 100,
      renderer: {
        type: 'switch',
        api: (value, row) =>
          updateGift(row.id, { status: value }).then(() => {
            reload();
          }),
        props: { activeValue: 1, inactiveValue: 0 },
      },
    },
    { prop: 'createdAt', label: t('common.creationTime'), renderer: 'datetime', minWidth: 170 },
  ],
  formSchemes: (): FormQueryScheme[] => [
    { prop: 'name', label: t('social.name') },
    {
      prop: 'status',
      label: t('social.status'),
      fieldType: 'select',
      fieldProps: {
        clearable: true,
        options: [
          { label: t('social.onSale'), value: 1 },
          { label: t('social.offSale'), value: 0 },
        ],
      },
    },
  ],
  actionColumn: {
    label: t('common.actions'),
    actions: (row) => [
      {
        hidden: cannot('update', 'social_gift'),
        label: t('common.edit'),
        icon: 'bi bi-pencil-square',
        onClick: () => {
          upsert.edit(row);
        },
      },
      {
        hidden: cannot('delete', 'social_gift'),
        label: t('common.delete'),
        icon: 'bi bi-trash3',
        type: 'danger',
        popconfirm: {
          title: t('common.confirmDelete'),
          confirm: () => onDelete(row.id),
        },
      },
    ],
    fixed: 'right',
    minWidth: 150,
  },
  height: '100%',
}));

const upsert = useOuterUpsert({
  success() {
    reload();
  },
});

const onDelete = async (id: number) => {
  return deleteGift(id).then(() => {
    ElMessage.success(t('common.deleteSuccess'));
    reload();
  });
};
</script>
