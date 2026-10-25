<template>
  <co-form-dialog v-bind="dialogProps" width="sm">
    <co-form v-bind="formProps" label-width="auto" width="md">
      <co-form-item
        v-model="model.userId"
        prop="userId"
        :label="t('social.user')"
        field-type="select"
        :field-props="{ options: users, filterable: true }"
        required
      />
      <co-form-item
        v-model="model.type"
        prop="type"
        :label="t('social.financeType.label')"
        field-type="select"
        :field-props="{ options: typeOptions }"
        required
      />
      <co-form-item
        v-model="model.amount"
        prop="amount"
        :label="t('social.amount')"
        field-type="number"
        required
      />
      <co-form-item
        v-model="model.balance"
        prop="balance"
        :label="t('social.balance')"
        field-type="number"
      />
      <co-form-item
        v-model="model.status"
        prop="status"
        :label="t('social.status')"
        field-type="select"
        :field-props="{ options: statusOptions }"
      />
      <co-form-item
        v-model="model.remark"
        prop="remark"
        :label="t('social.remark')"
        field-type="textarea"
        :field-props="{ rows: 2 }"
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

const { addFinance, updateFinance } = socialApi;

const typeOptions = ['recharge', 'consume', 'withdraw', 'reward'].map((value) => ({
  label: t(`social.financeType.${value}`),
  value,
}));

const statusOptions = ['success', 'pending', 'failed'].map((value) => ({
  label: t(`social.financeStatus.${value}`),
  value,
}));

interface Model {
  userId?: number;
  type?: string;
  amount?: number;
  balance?: number;
  status?: string;
  remark?: string;
}

interface Row extends Model {
  id: number;
}

const model = reactive<Model>({
  userId: undefined,
  type: 'recharge',
  amount: undefined,
  balance: 0,
  status: 'success',
  remark: undefined,
});

const { dialogProps, formProps, expose } = useUpsert<Model, Row>(
  computed(() => ({
    stuffTitle: t('social.finance'),
    model,
    addFetch: () => addFinance(model),
    editFetch: (row) => updateFinance(row.id, model),
  })),
);

defineExpose(expose);
</script>
