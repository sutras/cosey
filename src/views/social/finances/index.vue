<template>
  <co-container full-page>
    <co-table v-bind="tableProps">
      <template #toolbar-left>
        <el-button v-if="can('create', 'social_finance')" type="primary" @click="upsert.add()">
          {{ t('common.add') }}
        </el-button>
      </template>
    </co-table>

    <FinanceUpsert :ref="upsert.ref" :users="users" />
  </co-container>
</template>

<script lang="tsx" setup>
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import socialApi from '@/api/social';
import usersApi from '@/api/users';
import FinanceUpsert from './finance-upsert.vue';
import { useOuterUpsert } from 'cosey/hooks';
import { useTable } from 'cosey/components';
import type { FormQueryScheme } from 'cosey/components';
import { useAbility } from '@casl/vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineOptions({
  name: 'SocialFinances',
});

const { can, cannot } = useAbility();

const { getFinances, deleteFinance } = socialApi;
const { getUsers } = usersApi;

const types = ['recharge', 'consume', 'withdraw', 'reward'];
const statuses = ['success', 'pending', 'failed'];

const typeOptions = types.map((value) => ({ label: t(`social.financeType.${value}`), value }));
const statusOptions = statuses.map((value) => ({
  label: t(`social.financeStatus.${value}`),
  value,
}));

const users = ref<{ label: string; value: number }[]>([]);

onMounted(async () => {
  const { list } = await getUsers({ pageSize: 100 });
  users.value = list.map((row: any) => ({ label: row.nickname, value: row.id }));
});

const [tableProps, { reload }] = useTable(() => ({
  api: getFinances,
  columns: [
    { prop: 'id', label: 'ID', width: 80 },
    { prop: 'userAvatar', label: t('social.avatar'), renderer: 'media' },
    { prop: 'userNickname', label: t('social.user'), minWidth: 120 },
    {
      prop: 'type',
      label: t('social.financeType.label'),
      minWidth: 110,
      format: (value: string) => t(`social.financeType.${value}`),
    },
    {
      prop: 'amount',
      label: t('social.amount'),
      sortable: 'custom',
      minWidth: 120,
      format: (value: number) => (value > 0 ? `+${value}` : `${value}`),
    },
    { prop: 'balance', label: t('social.balance'), minWidth: 110 },
    {
      prop: 'status',
      label: t('social.status'),
      minWidth: 110,
      format: (value: string) => t(`social.financeStatus.${value}`),
    },
    { prop: 'remark', label: t('social.remark'), minWidth: 160 },
    { prop: 'createdAt', label: t('common.creationTime'), renderer: 'datetime', minWidth: 170 },
  ],
  formSchemes: (): FormQueryScheme[] => [
    {
      prop: 'userId',
      label: t('social.user'),
      fieldType: 'select',
      fieldProps: { options: users.value, filterable: true, clearable: true },
    },
    {
      prop: 'type',
      label: t('social.financeType.label'),
      fieldType: 'select',
      fieldProps: { options: typeOptions, clearable: true },
    },
    {
      prop: 'status',
      label: t('social.status'),
      fieldType: 'select',
      fieldProps: { options: statusOptions, clearable: true },
    },
    { prop: 'createdAt', label: t('common.creationTime'), fieldType: 'datetimerange' },
  ],
  actionColumn: {
    label: t('common.actions'),
    actions: (row) => [
      {
        hidden: cannot('update', 'social_finance'),
        label: t('common.edit'),
        icon: 'bi bi-pencil-square',
        onClick: () => {
          upsert.edit(row);
        },
      },
      {
        hidden: cannot('delete', 'social_finance'),
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
  return deleteFinance(id).then(() => {
    ElMessage.success(t('common.deleteSuccess'));
    reload();
  });
};
</script>
