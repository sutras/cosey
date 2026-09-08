<template>
  <co-container full-page>
    <co-table v-bind="tableProps">
      <template #toolbar-left>
        <el-button v-if="can('create', 'blog_post')" type="primary" @click="upsert.add()">
          {{ t('common.add') }}
        </el-button>
      </template>
      <template #action="{ row }">
        <co-table-action
          :actions="[
            {
              hidden: cannot('read', 'blog_comment'),
              label: t('post.comment'),
              icon: 'bi bi-chat-dots',
              onClick: () => {
                postComments?.open(row.id);
              },
            },
            {
              hidden: cannot('update', 'blog_post'),
              label: t('common.edit'),
              icon: 'bi bi-pencil-square',
              onClick: () => {
                upsert.edit(row);
              },
            },
            {
              hidden: cannot('delete', 'blog_post'),
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

    <PostsUpsert :ref="upsert.ref" />

    <PostComments ref="postComments" />
  </co-container>
</template>

<script lang="tsx" setup>
import { ElMessage } from 'element-plus';
import postsApi from '@/api/blog';
import PostsUpsert from './post-upsert.vue';
import { useOuterUpsert } from 'cosey/hooks';
import { useTable } from 'cosey/components';
import PostComments from './post-comments.vue';
import { computed, useTemplateRef } from 'vue';
import { useAbility } from '@casl/vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineOptions({
  name: 'BlogPosts',
});

const { can, cannot } = useAbility();

const { getPosts, deletePost } = postsApi;

const [tableProps, { reload }] = useTable(
  computed(() => ({
    api: getPosts,
    columns: [
      { prop: 'id', label: 'ID' },
      { prop: 'postType.name', label: t('post.categoryName') },
      { prop: 'title', label: t('post.title') },
      { prop: 'digest', label: t('post.summary') },
      { prop: 'createdAt', label: t('common.creationTime'), renderer: 'datetime' },
      { prop: 'updatedAt', label: t('common.updateTime'), renderer: 'datetime' },
    ],
    actionColumn: {
      label: t('common.actions'),
      slots: 'action',
      fixed: 'right',
      minWidth: 200,
    },
    height: '100%',
    formProps: {
      schemes: [
        { prop: 'postTypeName', label: t('post.categoryName') },
        { prop: 'title', label: t('post.title') },
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
  return deletePost(id).then(() => {
    ElMessage.success(t('common.deleteSuccess'));
    reload();
  });
};

const postComments = useTemplateRef('postComments');
</script>
