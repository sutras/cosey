<template>
  <co-form-group title="solid（默认）" border-style="solid">
    <co-form-item v-model="model.name" label="姓名" width="sm" />
    <co-form-item v-model="model.mobile" label="手机号" width="sm" />
  </co-form-group>

  <co-form-group title="dashed" border-style="dashed">
    <co-form-item v-model="model.company" label="公司" width="sm" />
    <co-form-item v-model="model.job" label="职位" width="sm" />
  </co-form-group>

  <co-form-group title="dotted" border-style="dotted">
    <co-form-item v-model="model.city" label="城市" width="sm" />
    <co-form-item v-model="model.detail" label="详细地址" width="sm" />
  </co-form-group>

  <co-form-group title="none（只要标题，不要边框）" border-style="none">
    <co-form-item v-model="model.remark" label="备注" width="md" />
  </co-form-group>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';

const model = reactive({
  name: '',
  mobile: '',
  company: '',
  job: '',
  city: '',
  detail: '',
  remark: '',
});
</script>
