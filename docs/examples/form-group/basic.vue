<template>
  <co-form-group title="基本信息">
    <co-form-item v-model="model.name" label="姓名" width="sm" />
    <co-form-item v-model="model.mobile" label="手机号" width="sm" />
  </co-form-group>

  <!-- 没有 title 时不渲染边框，只是把字段分成一组 -->
  <co-form-group>
    <co-form-item v-model="model.company" label="公司" width="sm" />
    <co-form-item v-model="model.job" label="职位" width="sm" />
  </co-form-group>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';

const model = reactive({
  name: '',
  mobile: '',
  company: '',
  job: '',
});
</script>
