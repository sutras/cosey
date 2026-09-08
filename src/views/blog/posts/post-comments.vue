<template>
  <co-stack-dialog v-model="visible" :title="t('post.comment')">
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
  </co-stack-dialog>

  <PostCommentsUpsert :ref="upsert.ref" />
</template>

<script lang="ts" setup>
import { useAbility } from '@casl/vue';
import PostCommentsUpsert from '../post-comments/post-comment-upsert.vue';
import postCommentsApi from '@/api/blog';
import { useTable } from 'cosey/components';
import { useOuterUpsert } from 'cosey/hooks';
import { ElMessage } from 'element-plus';
import { computed, nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const { cannot } = useAbility();

const postId = ref<number>();

const visible = ref(false);

const { getPostComments, deletePostComment } = postCommentsApi;

const [tableProps, { reload }] = useTable(
  computed(() => ({
    api: getPostComments,
    columns: [
      { prop: 'id', label: 'ID' },
      { prop: 'user.nickname', label: t('post.user') },
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

    immediate: false,

    transformParams(params) {
      return {
        ...params,
        postId: postId.value,
      };
    },
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

defineExpose({
  open(id: number) {
    postId.value = id;
    visible.value = true;

    nextTick(() => {
      reload();
    });
  },
});
</script>
