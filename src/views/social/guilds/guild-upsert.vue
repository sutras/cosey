<template>
  <co-form-dialog v-bind="dialogProps" width="sm">
    <co-form v-bind="formProps" label-width="auto" width="md">
      <co-form-item v-model="model.name" prop="name" :label="t('social.guildName')" required />
      <co-form-item
        v-model="model.avatar"
        prop="avatar"
        :label="t('social.avatar')"
        field-type="upload"
        :field-props="{ single: true }"
      />
      <co-form-item
        v-model="model.ownerId"
        prop="ownerId"
        :label="t('social.owner')"
        field-type="select"
        :field-props="{ options: users, filterable: true }"
        required
      />
      <co-form-item
        v-model="model.level"
        prop="level"
        :label="t('social.level')"
        field-type="number"
      />
      <co-form-item
        v-model="model.memberCount"
        prop="memberCount"
        :label="t('social.memberCount')"
        field-type="number"
      />
      <co-form-item
        v-model="model.notice"
        prop="notice"
        :label="t('social.notice')"
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
            { label: t('social.normal'), value: 1 },
            { label: t('social.disbanded'), value: 0 },
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
}>();

const { addGuild, updateGuild } = socialApi;

interface Model {
  name?: string;
  avatar?: string;
  ownerId?: number;
  level?: number;
  memberCount?: number;
  notice?: string;
  status?: number;
}

interface Row extends Model {
  id: number;
}

const model = reactive<Model>({
  name: undefined,
  avatar: undefined,
  ownerId: undefined,
  level: 1,
  memberCount: 0,
  notice: undefined,
  status: 1,
});

const { dialogProps, formProps, expose } = useUpsert<Model, Row>(
  computed(() => ({
    stuffTitle: t('social.guild'),
    model,
    addFetch: () => addGuild(model),
    editFetch: (row) => updateGuild(row.id, model),
  })),
);

defineExpose(expose);
</script>
