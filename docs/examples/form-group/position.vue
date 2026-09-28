<template>
  <co-form-group title="标题在左" position="left">
    <co-form-item v-model="model.name" label="姓名" width="sm" />
    <co-form-item v-model="model.mobile" label="手机号" width="sm" />
  </co-form-group>

  <co-form-group title="标题居中" position="center">
    <co-form-item v-model="model.company" label="公司" width="sm" />
    <co-form-item v-model="model.job" label="职位" width="sm" />
  </co-form-group>

  <co-form-group title="标题在右" position="right">
    <co-form-item v-model="model.city" label="城市" width="sm" />
    <co-form-item v-model="model.detail" label="详细地址" width="sm" />
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
});
</script>
