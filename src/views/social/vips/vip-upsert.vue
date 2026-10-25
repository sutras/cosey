<template>
  <co-form-dialog v-bind="dialogProps" width="sm">
    <co-form v-bind="formProps" label-width="auto" width="md">
      <co-form-item
        v-model="model.level"
        prop="level"
        :label="t('social.level')"
        field-type="number"
        required
      />
      <co-form-item v-model="model.name" prop="name" :label="t('social.vipName')" required />
      <co-form-item
        v-model="model.icon"
        prop="icon"
        :label="t('social.icon')"
        field-type="upload"
        :field-props="{ single: true }"
      />
      <co-form-item
        v-model="model.price"
        prop="price"
        :label="t('social.price')"
        field-type="number"
        required
      />
      <co-form-item
        v-model="model.duration"
        prop="duration"
        :label="t('social.duration')"
        field-type="number"
      />
      <co-form-item
        v-model="model.benefits"
        prop="benefits"
        :label="t('social.benefits')"
        field-type="textarea"
        :field-props="{ rows: 4 }"
      />
      <co-form-item
        v-model="model.status"
        prop="status"
        :label="t('social.status')"
        field-type="select"
        :field-props="{
          options: [
            { label: t('social.enabled'), value: 1 },
            { label: t('social.disabled'), value: 0 },
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

const { addVip, updateVip } = socialApi;

interface Model {
  level?: number;
  name?: string;
  icon?: string;
  price?: number;
  duration?: number;
  benefits?: string;
  status?: number;
}

interface Row extends Model {
  id: number;
}

const model = reactive<Model>({
  level: 1,
  name: undefined,
  icon: undefined,
  price: undefined,
  duration: 30,
  benefits: undefined,
  status: 1,
});

const { dialogProps, formProps, expose } = useUpsert<Model, Row>(
  computed(() => ({
    stuffTitle: t('social.vip'),
    model,
    addFetch: () => addVip(model),
    editFetch: (row) => updateVip(row.id, model),
  })),
);

defineExpose(expose);
</script>
