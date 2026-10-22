<template>
  <co-form :model="model" label-width="72px" :submit="onSubmit" style="max-width: 460px">
    <co-form-item
      prop="productId"
      label="商品"
      :rules="[{ required: true, message: '请选择商品' }]"
    >
      <co-table-select
        v-model="model.productId"
        title="选择商品"
        placeholder="请选择商品"
        :api="queryProducts"
        :columns="columns"
        :props="{ label: 'name', value: 'id' }"
        :form-props="formProps"
        :fetch-selected="pickProducts"
      />
    </co-form-item>

    <template #button="{ submit, reset }">
      <el-button type="primary" @click="submit()">提交</el-button>
      <el-button @click="reset()">重置</el-button>
    </template>
  </co-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { columns, formProps, queryProducts, pickProducts } from './data';

const model = reactive<{ productId?: number }>({
  productId: undefined,
});

const onSubmit = () => {
  ElMessage.success(`提交商品：${model.productId}`);
};
</script>
