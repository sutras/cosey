<template>
  <div>
    <co-table-select
      v-model="value"
      title="选择商品"
      placeholder="请选择商品"
      :api="queryProducts"
      :columns="columns"
      :props="{ label: 'name', value: 'id' }"
      :form-props="formProps"
      :fetch-selected="pickProducts"
    />

    <div :style="tipStyle">当前值：{{ value ?? '空' }}</div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { columns, formProps, queryProducts, pickProducts } from './data';

const value = ref(3);

const tipStyle = {
  marginTop: '12px',
  fontSize: '13px',
  color: 'var(--el-text-color-secondary)',
};
</script>
