<template>
  <co-container full-page>
    <co-table v-bind="tableProps">
      <template #toolbar-left>
        <el-button v-if="can('create', 'social_guild')" type="primary" @click="upsert.add()">
          {{ t('common.add') }}
        </el-button>
      </template>
    </co-table>

    <GuildUpsert :ref="upsert.ref" :users="users" />
  </co-container>
</template>

<script lang="tsx" setup>
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import socialApi from '@/api/social';
import usersApi from '@/api/users';
import GuildUpsert from './guild-upsert.vue';
import { useOuterUpsert } from 'cosey/hooks';
import { useTable } from 'cosey/components';
import type { FormQueryScheme } from 'cosey/components';
import { useAbility } from '@casl/vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineOptions({
  name: 'SocialGuilds',
});

const { can, cannot } = useAbility();

const { getGuilds, updateGuild, deleteGuild } = socialApi;
const { getUsers } = usersApi;

const users = ref<{ label: string; value: number }[]>([]);

onMounted(async () => {
  const { list } = await getUsers({ pageSize: 100 });
  users.value = list.map((row: any) => ({ label: row.nickname, value: row.id }));
});

const [tableProps, { reload }] = useTable(() => ({
  api: getGuilds,
  columns: [
    { prop: 'id', label: 'ID', width: 80 },
    { prop: 'avatar', label: t('social.avatar'), renderer: 'media' },
    { prop: 'name', label: t('social.guildName'), minWidth: 140 },
    { prop: 'ownerNickname', label: t('social.owner'), minWidth: 120 },
    { prop: 'level', label: t('social.level'), sortable: 'custom', width: 100 },
    { prop: 'memberCount', label: t('social.memberCount'), sortable: 'custom', width: 110 },
    { prop: 'notice', label: t('social.notice'), renderer: 'longtext', minWidth: 240 },
    {
      prop: 'status',
      label: t('social.status'),
      width: 100,
      renderer: {
        type: 'switch',
        api: (value, row) =>
          updateGuild(row.id, { status: value }).then(() => {
            reload();
          }),
        props: { activeValue: 1, inactiveValue: 0 },
      },
    },
    { prop: 'createdAt', label: t('common.creationTime'), renderer: 'datetime', minWidth: 170 },
  ],
  formSchemes: (): FormQueryScheme[] => [
    { prop: 'name', label: t('social.guildName') },
    {
      prop: 'ownerId',
      label: t('social.owner'),
      fieldType: 'select',
      fieldProps: { options: users.value, filterable: true, clearable: true },
    },
    {
      prop: 'status',
      label: t('social.status'),
      fieldType: 'select',
      fieldProps: {
        clearable: true,
        options: [
          { label: t('social.normal'), value: 1 },
          { label: t('social.disbanded'), value: 0 },
        ],
      },
    },
  ],
  actionColumn: {
    label: t('common.actions'),
    actions: (row) => [
      {
        hidden: cannot('update', 'social_guild'),
        label: t('common.edit'),
        icon: 'bi bi-pencil-square',
        onClick: () => {
          upsert.edit(row);
        },
      },
      {
        hidden: cannot('delete', 'social_guild'),
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
  return deleteGuild(id).then(() => {
    ElMessage.success(t('common.deleteSuccess'));
    reload();
  });
};
</script>
