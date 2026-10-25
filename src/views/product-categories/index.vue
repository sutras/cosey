<template>
  <co-container full-page>
    <co-table v-bind="tableProps">
      <template #toolbar-left>
        <el-button v-if="can('create', 'product_category')" type="primary" @click="upsert.add()">
          {{ t('common.add') }}
        </el-button>
      </template>
    </co-table>

    <ProductCategoryUpsert :ref="upsert.ref" />
  </co-container>
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus';
import productsApi from '@/api/products';
import ProductCategoryUpsert from './product-category-upsert.vue';
import { useOuterUpsert } from 'cosey/hooks';
import { useTable } from 'cosey/components';
import { useAbility } from '@casl/vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineOptions({
  name: 'ProductCategories',
});

const { can, cannot } = useAbility();

const { getProductCategories, deleteProductCategory } = productsApi;

const [tableProps, { reload }] = useTable(() => ({
  api: getProductCategories,
  columns: [
    { prop: 'id', label: 'ID', width: 80 },
    { prop: 'name', label: t('product.categoryName') },
    { prop: 'description', label: t('product.description') },
    { prop: 'sort', label: t('product.sort'), width: 100 },
    { prop: 'createdAt', label: t('common.creationTime'), renderer: 'datetime' },
    { prop: 'updatedAt', label: t('common.updateTime'), renderer: 'datetime' },
  ],
  formSchemes: [{ prop: 'name', label: t('product.categoryName') }],
  actionColumn: {
    label: t('common.actions'),
    actions: (row) => [
      {
        hidden: cannot('update', 'product_category'),
        label: t('common.edit'),
        icon: 'bi bi-pencil-square',
        onClick: () => {
          upsert.edit(row);
        },
      },
      {
        hidden: cannot('delete', 'product_category'),
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
    minWidth: 140,
  },
  height: '100%',
}));

const upsert = useOuterUpsert({
  success() {
    reload();
  },
});

const onDelete = async (id: number) => {
  return deleteProductCategory(id).then(() => {
    ElMessage.success(t('common.deleteSuccess'));
    reload();
  });
};
</script>
