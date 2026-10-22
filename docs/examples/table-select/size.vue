<template>
  <div>
    <co-table-select
      v-model="value"
      drawer
      :width="640"
      title="选择商品"
      placeholder="抽屉形态"
      :api="queryProducts"
      :columns="columns"
      :props="{ label: 'name', value: 'id' }"
      :form-props="formProps"
      :fetch-selected="pickProducts"
    />

    <co-table-select
      v-model="smallValue"
      size="small"
      title="选择商品"
      placeholder="小尺寸"
      :api="queryProducts"
      :columns="columns"
      :props="{ label: 'name', value: 'id' }"
      :form-props="formProps"
      :fetch-selected="pickProducts"
    />

    <div :style="tipStyle">当前值：{{ value ?? '空' }} / {{ smallValue ?? '空' }}</div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { columns, formProps, queryProducts, pickProducts } from './data';

const value = ref();
const smallValue = ref();

const tipStyle = {
  marginTop: '12px',
  fontSize: '13px',
  color: 'var(--el-text-color-secondary)',
};
</script>

<style lang="scss" scoped>
.co-table-select + .co-table-select {
  margin-top: 12px;
}
</style>
