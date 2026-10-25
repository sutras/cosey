<template>
  <co-container full-page>
    <co-table v-bind="tableProps">
      <template #toolbar-left>
        <el-button v-if="can('create', 'social_moment')" type="primary" @click="upsert.add()">
          {{ t('common.add') }}
        </el-button>
      </template>
    </co-table>

    <MomentUpsert :ref="upsert.ref" :users="users" :topics="topics" />
  </co-container>
</template>

<script lang="tsx" setup>
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import socialApi from '@/api/social';
import usersApi from '@/api/users';
import MomentUpsert from './moment-upsert.vue';
import { useOuterUpsert } from 'cosey/hooks';
import { useTable } from 'cosey/components';
import type { FormQueryScheme } from 'cosey/components';
import { useAbility } from '@casl/vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineOptions({
  name: 'SocialMoments',
});

const { can, cannot } = useAbility();

const { getMoments, getTopics, updateMoment, deleteMoment } = socialApi;
const { getUsers } = usersApi;

const users = ref<{ label: string; value: number }[]>([]);
const topics = ref<{ label: string; value: number }[]>([]);

onMounted(async () => {
  const [userRes, topicRes] = await Promise.all([
    getUsers({ pageSize: 100 }),
    getTopics({ pageSize: 100 }),
  ]);

  users.value = userRes.list.map((row: any) => ({ label: row.nickname, value: row.id }));
  topics.value = topicRes.list.map((row: any) => ({ label: row.name, value: row.id }));
});

const [tableProps, { reload }] = useTable(() => ({
  api: getMoments,
  columns: [
    { prop: 'id', label: 'ID', width: 80 },
    { prop: 'userAvatar', label: t('social.avatar'), renderer: 'media' },
    { prop: 'userNickname', label: t('social.author'), minWidth: 120 },
    { prop: 'topicName', label: t('social.topic'), minWidth: 100 },
    { prop: 'content', label: t('social.content'), renderer: 'longtext', minWidth: 280 },
    {
      prop: 'images',
      label: t('social.images'),
      renderer: { type: 'mediagroup', props: { size: 'mini' } },
      minWidth: 240,
    },
    { prop: 'likeCount', label: t('social.likeCount'), sortable: 'custom', width: 100 },
    { prop: 'commentCount', label: t('social.commentCount'), sortable: 'custom', width: 100 },
    {
      prop: 'status',
      label: t('social.status'),
      width: 100,
      renderer: {
        type: 'switch',
        api: (value, row) =>
          updateMoment(row.id, { status: value }).then(() => {
            reload();
          }),
        props: { activeValue: 1, inactiveValue: 0 },
      },
    },
    { prop: 'createdAt', label: t('common.creationTime'), renderer: 'datetime', minWidth: 170 },
  ],
  formSchemes: (): FormQueryScheme[] => [
    { prop: 'content', label: t('social.content') },
    {
      prop: 'topicId',
      label: t('social.topic'),
      fieldType: 'select',
      fieldProps: { options: topics.value, clearable: true },
    },
    {
      prop: 'status',
      label: t('social.status'),
      fieldType: 'select',
      fieldProps: {
        clearable: true,
        options: [
          { label: t('social.normal'), value: 1 },
          { label: t('social.hidden'), value: 0 },
        ],
      },
    },
  ],
  actionColumn: {
    label: t('common.actions'),
    actions: (row) => [
      {
        hidden: cannot('update', 'social_moment'),
        label: t('common.edit'),
        icon: 'bi bi-pencil-square',
        onClick: () => {
          upsert.edit(row);
        },
      },
      {
        hidden: cannot('delete', 'social_moment'),
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
  return deleteMoment(id).then(() => {
    ElMessage.success(t('common.deleteSuccess'));
    reload();
  });
};
</script>
