<template>
  <co-container full-page>
    <co-table v-bind="tableProps">
      <template #toolbar-left>
        <el-button v-if="can('create', 'blog_type')" type="primary" @click="upsert.add()">
          {{ t('common.add') }}
        </el-button>
      </template>
      <template #action="{ row }">
        <co-table-action
          :actions="[
            {
              hidden: cannot('update', 'blog_type'),
              label: t('common.edit'),
              icon: 'bi bi-pencil-square',
              onClick: () => {
                upsert.edit(row);
              },
            },
            {
              hidden: cannot('delete', 'blog_type'),
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

    <PosttypesUpsert :ref="upsert.ref" />
  </co-container>
</template>

<script lang="tsx" setup>
import PosttypesUpsert from './post-type-upsert.vue';
import { useOuterUpsert } from 'cosey/hooks';
import { useTable } from 'cosey/components';
import posttypesApi from '@/api/blog';
import { ElMessage } from 'element-plus';
import { useAbility } from '@casl/vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineOptions({
  name: 'BlogPostTypes',
});

const { can, cannot } = useAbility();

const { getPosttypes, deletePosttype } = posttypesApi;

const [tableProps, { reload }] = useTable(
  computed(() => ({
    api: getPosttypes,
    columns: [
      { prop: 'id', label: 'ID' },
      { prop: 'name', label: t('post.categoryName') },
      { prop: 'description', label: t('post.description') },
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
  return deletePosttype(id).then(() => {
    ElMessage.success(t('common.deleteSuccess'));
    reload();
  });
};
</script>
