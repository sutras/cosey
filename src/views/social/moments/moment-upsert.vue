<template>
  <co-form-dialog v-bind="dialogProps" width="sm">
    <co-form v-bind="formProps" label-width="auto" width="md">
      <co-form-item
        v-model="model.userId"
        prop="userId"
        :label="t('social.author')"
        field-type="select"
        :field-props="{ options: users, filterable: true }"
        required
      />
      <co-form-item
        v-model="model.topicId"
        prop="topicId"
        :label="t('social.topic')"
        field-type="select"
        :field-props="{ options: topics }"
        required
      />
      <co-form-item
        v-model="model.content"
        prop="content"
        :label="t('social.content')"
        field-type="textarea"
        :field-props="{ rows: 4 }"
        required
      />
      <co-form-item
        v-model="model.images"
        prop="images"
        :label="t('social.images')"
        field-type="upload"
        :field-props="{ multiple: true, limit: 9 }"
      />
      <co-form-item
        v-model="model.status"
        prop="status"
        :label="t('social.status')"
        field-type="select"
        :field-props="{
          options: [
            { label: t('social.normal'), value: 1 },
            { label: t('social.hidden'), value: 0 },
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

defineProps<{
  users: { label: string; value: number }[];
  topics: { label: string; value: number }[];
}>();

const { addMoment, updateMoment } = socialApi;

interface Model {
  userId?: number;
  topicId?: number;
  content?: string;
  images?: string[];
  status?: number;
}

interface Row extends Model {
  id: number;
}

const model = reactive<Model>({
  userId: undefined,
  topicId: undefined,
  content: undefined,
  images: undefined,
  status: 1,
});

const { dialogProps, formProps, expose } = useUpsert<Model, Row>(
  computed(() => ({
    stuffTitle: t('social.moment'),
    model,
    addFetch: () => addMoment(model),
    editFetch: (row) => updateMoment(row.id, model),
  })),
);

defineExpose(expose);
</script>
