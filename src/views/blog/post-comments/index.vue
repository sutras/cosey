<template>
  <co-container full-page>
    <co-table v-bind="tableProps">
      <template #action="{ row }">
        <co-table-action
          :actions="[
            {
              hidden: cannot('update', 'blog_comment'),
              label: t('common.edit'),
              icon: 'bi bi-pencil-square',
              onClick: () => {
                upsert.edit(row);
              },
            },
            {
              hidden: cannot('delete', 'blog_comment'),
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

    <PostCommentsUpsert :ref="upsert.ref" />
  </co-container>
</template>

<script lang="tsx" setup>
import PostCommentsUpsert from './post-comment-upsert.vue';
import { useOuterUpsert } from 'cosey/hooks';
import { useTable } from 'cosey/components';
import postCommentsApi from '@/api/blog';
import { ElMessage } from 'element-plus';
import { useAbility } from '@casl/vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineOptions({
  name: 'BlogPostComments',
});

const { cannot } = useAbility();

const { getPostComments, deletePostComment } = postCommentsApi;

const [tableProps, { reload }] = useTable(
  computed(() => ({
    api: getPostComments,
    columns: [
      { prop: 'id', label: 'ID' },
      { prop: 'user.nickname', label: t('post.user') },
      { prop: 'post.title', label: t('post.article') },
      { prop: 'content', label: t('post.content') },
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
  return deletePostComment(id).then(() => {
    ElMessage.success(t('common.deleteSuccess'));
    reload();
  });
};
</script>
