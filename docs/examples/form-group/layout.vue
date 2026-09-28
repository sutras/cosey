<template>
  <co-form-group title="自定义间距" :size="[16, 16]">
    <co-form-item v-model="model.a" label="字段一" width="sm" />
    <co-form-item v-model="model.b" label="字段二" width="sm" />
  </co-form-group>

  <co-form-group title="纵向排列" direction="vertical" alignment="flex-start" :size="[0, 16]">
    <co-form-item v-model="model.c" label="字段三" width="sm" />
    <co-form-item v-model="model.d" label="字段四" width="sm" />
  </co-form-group>

  <co-form-group title="垂直居中" alignment="center" :size="[16, 16]">
    <co-form-item v-model="model.e" label="单行" width="sm" />
    <co-form-item v-model="model.f" label="多行" width="sm" field-type="textarea" />
  </co-form-group>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';

const model = reactive({
  a: '',
  b: '',
  c: '',
  d: '',
  e: '',
  f: '',
});
</script>
