<template>
  <co-form-dialog v-bind="dialogProps" width="sm">
    <co-form v-bind="formProps" label-width="auto" width="md">
      <co-form-item v-model="model.name" prop="name" :label="t('social.name')" required />
      <co-form-item
        v-model="model.icon"
        prop="icon"
        :label="t('social.icon')"
        field-type="upload"
        :field-props="{ single: true }"
      />
      <co-form-item
        v-model="model.category"
        prop="category"
        :label="t('social.category.label')"
        field-type="select"
        :field-props="{ options: categoryOptions }"
        required
      />
      <co-form-item
        v-model="model.price"
        prop="price"
        :label="t('social.price')"
        field-type="number"
        required
      />
      <co-form-item
        v-model="model.stock"
        prop="stock"
        :label="t('social.stock')"
        field-type="number"
      />
      <co-form-item
        v-model="model.description"
        prop="description"
        :label="t('social.description')"
        field-type="textarea"
        :field-props="{ rows: 3 }"
      />
      <co-form-item
        v-model="model.status"
        prop="status"
        :label="t('social.status')"
        field-type="select"
        :field-props="{
          options: [
            { label: t('social.onSale'), value: 1 },
            { label: t('social.offSale'), value: 0 },
          ],
        }"
      />
    </co-form>
  </co-form-dialog>
</template>

<script lang="ts" setup>
import { computed, reactive } from 'vue';
import socialApi from '@/api/social';
import { useUpsert } from 'cosey/hooks';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const { addProp, updateProp } = socialApi;

const categoryOptions = ['avatar_frame', 'chat_bubble', 'entrance', 'card'].map((value) => ({
  label: t(`social.category.${value}`),
  value,
}));

interface Model {
  name?: string;
  icon?: string;
  category?: string;
  price?: number;
  stock?: number;
  description?: string;
  status?: number;
}

interface Row extends Model {
  id: number;
}

const model = reactive<Model>({
  name: undefined,
  icon: undefined,
  category: undefined,
  price: undefined,
  stock: 0,
  description: undefined,
  status: 1,
});

const { dialogProps, formProps, expose } = useUpsert<Model, Row>(
  computed(() => ({
    stuffTitle: t('social.prop'),
    model,
    addFetch: () => addProp(model),
    editFetch: (row) => updateProp(row.id, model),
  })),
);

defineExpose(expose);
</script>
