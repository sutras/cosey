<template>
  <co-form-group title="订单信息" direction="vertical" :size="[0, 16]">
    <co-form-item v-model="model.no" label="订单号" width="sm" />
    <co-form-item v-model="model.amount" label="金额" width="sm" />

    <co-form-group title="收货地址" collapsible v-model:collapsed="collapsed" :size="[16, 16]">
      <co-form-item v-model="model.city" label="城市" width="sm" />
      <co-form-item v-model="model.detail" label="详细地址" width="md" />
    </co-form-group>
  </co-form-group>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';

const model = reactive({
  no: '',
  amount: '',
  city: '',
  detail: '',
});

const collapsed = ref(false);
</script>
