<template>
  <co-form-dialog v-bind="dialogProps" width="sm">
    <co-form v-bind="formProps" label-width="auto" width="md">
      <co-form-item v-model="model.name" prop="name" :label="t('social.name')" required />
      <co-form-item
        v-model="model.cover"
        prop="cover"
        :label="t('social.cover')"
        field-type="upload"
        :field-props="{ single: true }"
      />
      <co-form-item
        v-model="model.description"
        prop="description"
        :label="t('social.description')"
        field-type="textarea"
        :field-props="{ rows: 3 }"
      />
      <co-form-item
        v-model="model.sort"
        prop="sort"
        :label="t('common.sort')"
        field-type="number"
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

const { addTopic, updateTopic } = socialApi;

interface Model {
  name?: string;
  cover?: string;
  description?: string;
  sort?: number;
  status?: number;
}

interface Row extends Model {
  id: number;
}

const model = reactive<Model>({
  name: undefined,
  cover: undefined,
  description: undefined,
  sort: 1,
  status: 1,
});

const { dialogProps, formProps, expose } = useUpsert<Model, Row>(
  computed(() => ({
    stuffTitle: t('social.topic'),
    model,
    addFetch: () => addTopic(model),
    editFetch: (row) => updateTopic(row.id, model),
  })),
);

defineExpose(expose);
</script>
