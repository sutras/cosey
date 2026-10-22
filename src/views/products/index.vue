<template>
  <co-container full-page>
    <co-table v-bind="tableProps">
      <template #toolbar-left>
        <el-button v-if="can('create', 'product')" type="primary" @click="upsert.add()">
          {{ t('common.add') }}
        </el-button>
        <el-button
          v-if="can('update', 'product')"
          type="primary"
          @click="onBatchStatus(t('product.confirmOnSale'), 1)"
        >
          {{ t('product.batchOnSale') }}
        </el-button>
        <el-button
          v-if="can('update', 'product')"
          type="primary"
          @click="onBatchStatus(t('product.confirmOffSale'), 0)"
        >
          {{ t('product.batchOffSale') }}
        </el-button>
      </template>
      <template #action="{ row }">
        <co-table-action
          :actions="[
            {
              hidden: cannot('update', 'product'),
              label: t('common.edit'),
              icon: 'bi bi-pencil-square',
              onClick: () => {
                upsert.edit(row);
              },
            },
            {
              hidden: cannot('delete', 'product'),
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

    <ProductUpsert :ref="upsert.ref" :categories="categories" />
  </co-container>
</template>

<script lang="tsx" setup>
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import productsApi from '@/api/products';
import ProductUpsert from './product-upsert.vue';
import { useOuterUpsert } from 'cosey/hooks';
import { useTable } from 'cosey/components';
import type { FormQueryScheme } from 'cosey/components';
import { useAbility } from '@casl/vue';
import { warningConfirm } from 'cosey/utils';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineOptions({
  name: 'Products',
});

const { can, cannot } = useAbility();

const { getProducts, deleteProduct, updateProduct, updateBulkStatus, getProductCategories } =
  productsApi;

const categories = ref<{ label: string; value: number }[]>([]);

onMounted(async () => {
  const { list } = await getProductCategories({ pageSize: 100 });
  categories.value = list.map((row: any) => ({ label: row.name, value: row.id }));
});

const [tableProps, { reload, getSelectionRows }] = useTable(() => ({
  api: getProducts,
  columns: [
    { type: 'selection' },
    { prop: 'id', label: 'ID' },
    { prop: 'cover', label: t('product.cover'), renderer: 'media', width: 80 },
    { prop: 'name', label: t('product.name'), minWidth: 260, tooltip: t('product.name') },
    { prop: 'code', label: t('product.code'), minWidth: 120 },
    { prop: 'categoryName', label: t('product.category') },
    { prop: 'price', label: t('product.price'), sortable: 'custom' },
    { prop: 'stock', label: t('product.stock'), sortable: 'custom' },
    { prop: 'unit', label: t('product.unit') },
    {
      prop: 'status',
      label: t('product.status'),
      renderer: {
        type: 'switch',
        api: (value, row) =>
          updateProduct(row.id, { status: value }).then(() => {
            reload();
          }),
        props: { activeValue: 1, inactiveValue: 0 },
      },
    },
    { prop: 'createdAt', label: t('common.creationTime'), renderer: 'date', minWidth: 110 },
  ],
  formSchemes: (): FormQueryScheme[] => [
    { prop: 'keyword', label: t('product.keyword') },
    {
      prop: 'categoryId',
      label: t('product.category'),
      fieldType: 'select',
      fieldProps: { options: categories.value, clearable: true },
    },
    {
      prop: 'status',
      label: t('product.status'),
      fieldType: 'select',
      fieldProps: {
        clearable: true,
        options: [
          { label: t('product.onSale'), value: 1 },
          { label: t('product.offSale'), value: 0 },
        ],
      },
    },
    { prop: 'minPrice', label: t('product.minPrice'), fieldType: 'number' },
    { prop: 'maxPrice', label: t('product.maxPrice'), fieldType: 'number' },
  ],
  actionColumn: {
    label: t('common.actions'),
    slots: 'action',
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
  return deleteProduct(id).then(() => {
    ElMessage.success(t('common.deleteSuccess'));
    reload();
  });
};

const onBatchStatus = (message: string, value: number) => {
  const ids = getSelectionRows().map((item: any) => item.id);

  if (ids.length === 0) {
    ElMessage(t('common.pleaseSelect'));
  } else {
    warningConfirm(message).then(() =>
      updateBulkStatus({ ids, value }).then(() => {
        ElMessage.success(t('common.operationSuccess'));
        reload();
      }),
    );
  }
};
</script>
