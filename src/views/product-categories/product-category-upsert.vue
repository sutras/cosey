<template>
  <co-form-dialog v-bind="dialogProps" width="fit-content">
    <co-form v-bind="formProps" label-width="auto" width="md">
      <co-form-item v-model="model.name" prop="name" :label="t('product.categoryName')" required />
      <co-form-item
        v-model="model.description"
        prop="description"
        :label="t('product.description')"
        field-type="textarea"
      />
      <co-form-item
        v-model="model.sort"
        prop="sort"
        :label="t('product.sort')"
        field-type="number"
      />
    </co-form>
  </co-form-dialog>
</template>

<script lang="ts" setup>
import { computed, reactive } from 'vue';
import productsApi from '@/api/products';
import { useUpsert } from 'cosey/hooks';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const { addProductCategory, updateProductCategory } = productsApi;

interface Model {
  name?: string;
  description?: string;
  sort?: number;
}

interface Row extends Model {
  id: number;
}

const model = reactive<Model>({
  name: undefined,
  description: undefined,
  sort: undefined,
});

const { dialogProps, formProps, expose } = useUpsert<Model, Row>(
  computed(() => ({
    stuffTitle: t('product.categoryName'),
    model,
    addFetch: () => addProductCategory(model),
    editFetch: (row) => updateProductCategory(row.id, model),
  })),
);

defineExpose(expose);
</script>
