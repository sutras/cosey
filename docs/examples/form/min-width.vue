<template>
  <div>
    <p style="margin: 0 0 8px; font-size: 12px; color: var(--vp-c-text-2)">不设 min-width</p>
    <co-form :model="formModel" inline label-width="auto">
      <co-form-item v-model="formModel.name" prop="name" label="客户" field-type="input" />
      <co-form-item v-model="formModel.company" prop="company" label="公司" field-type="input" />
      <co-form-item
        v-model="formModel.contract.name"
        prop="contract.name"
        label="合同"
        field-type="input"
      />
      <co-form-item v-model="formModel.owner" prop="owner" label="负责人" field-type="input" />
    </co-form>

    <p style="margin: 16px 0 8px; font-size: 12px; color: var(--vp-c-text-2)">min-width="320"</p>
    <co-form :model="formModel" inline label-width="auto" :min-width="320">
      <co-form-item v-model="formModel.name" prop="name" label="客户" field-type="input" />
      <co-form-item v-model="formModel.company" prop="company" label="公司" field-type="input" />
      <co-form-item
        v-model="formModel.contract.name"
        prop="contract.name"
        label="合同"
        field-type="input"
      />
      <co-form-item v-model="formModel.owner" prop="owner" label="负责人" field-type="input" />
    </co-form>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';

const formModel = reactive({
  name: undefined,
  company: undefined,
  contract: {
    name: undefined,
  },
  owner: undefined,
});
</script>
