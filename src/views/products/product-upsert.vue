<template>
  <co-form-dialog v-bind="dialogProps" width="xl">
    <co-form v-bind="formProps" label-width="110px" width="md">
      <co-form-group :title="t('product.basicInfo')">
        <co-form-item v-model="model.name" prop="name" :label="t('product.name')" required />
        <co-form-item v-model="model.code" prop="code" :label="t('product.code')" required />
        <co-form-item
          v-model="model.categoryId"
          prop="categoryId"
          :label="t('product.category')"
          field-type="select"
          :field-props="{ options: categories }"
          required
        />
        <co-form-item
          v-model="model.status"
          prop="status"
          :label="t('product.status')"
          field-type="select"
          :field-props="{
            options: [
              { label: t('product.onSale'), value: 1 },
              { label: t('product.offSale'), value: 0 },
            ],
          }"
        />
      </co-form-group>
      <co-form-group :title="t('product.saleInfo')">
        <co-form-item
          v-model="model.price"
          prop="price"
          :label="t('product.price')"
          field-type="number"
          required
        />
        <co-form-item
          v-model="model.stock"
          prop="stock"
          :label="t('product.stock')"
          field-type="number"
        />
        <co-form-item v-model="model.spec" prop="spec" :label="t('product.spec')" />
        <co-form-item v-model="model.unit" prop="unit" :label="t('product.unit')" />
      </co-form-group>
      <co-form-group :title="t('product.mediaInfo')">
        <co-form-item
          v-model="model.cover"
          prop="cover"
          :label="t('product.cover')"
          field-type="upload"
          :field-props="{ single: true }"
        />
        <co-form-item
          v-model="model.description"
          prop="description"
          :label="t('product.description')"
          field-type="textarea"
          :field-props="{ rows: 3 }"
        />
      </co-form-group>
    </co-form>
  </co-form-dialog>
</template>

<script lang="ts" setup>
import { computed, reactive } from 'vue';
import productsApi from '@/api/products';
import { useUpsert } from 'cosey/hooks';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineProps<{
  categories: { label: string; value: number }[];
}>();

const { addProduct, updateProduct } = productsApi;

interface Model {
  name?: string;
  code?: string;
  categoryId?: number;
  status?: number;
  price?: number;
  stock?: number;
  spec?: string;
  unit?: string;
  cover?: string;
  description?: string;
}

interface Row extends Model {
  id: number;
}

const model = reactive<Model>({
  name: undefined,
  code: undefined,
  categoryId: undefined,
  status: 1,
  price: undefined,
  stock: undefined,
  spec: undefined,
  unit: undefined,
  cover: undefined,
  description: undefined,
});

const { dialogProps, formProps, expose } = useUpsert<Model, Row>(
  computed(() => ({
    stuffTitle: t('product.product'),
    model,
    addFetch: () => addProduct(model),
    editFetch: (row) => updateProduct(row.id, model),
  })),
);

defineExpose(expose);
</script>
