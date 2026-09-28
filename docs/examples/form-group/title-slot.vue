<template>
  <co-form-group>
    <template #title>
      <span>收货信息</span>
      <el-tag style="margin-inline-start: 6px" type="danger" size="small">必填</el-tag>
    </template>
    <template #tooltip>请填写真实地址与电话，否则可能无法配送。</template>

    <co-form-item v-model="model.name" label="收件人" width="sm" required />
    <co-form-item v-model="model.tel" label="手机号" width="sm" required />
    <co-form-item v-model="model.address" label="详细地址" width="md" />
  </co-form-group>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';

const model = reactive({
  name: '',
  tel: '',
  address: '',
});
</script>
