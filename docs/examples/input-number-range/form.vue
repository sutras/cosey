<template>
  <div class="stack">
    <co-form :model="model" label-width="auto" :submit="onSubmit">
      <co-form-item
        v-model="model.price"
        prop="price"
        label="价格区间"
        field-type="numberrange"
        width="sm"
        :field-props="{ min: 0, max: 99999, precision: 2 }"
        :rules="[{ required: true, message: '请把价格区间两端都填上' }]"
      />
      <co-form-item
        v-model="model.stock"
        prop="stock"
        label="库存区间"
        field-type="numberrange"
        width="sm"
        :field-props="{ min: 0, step: 10 }"
      />
    </co-form>

    <p class="state">
      提交值：
      <code>{{ submitted }}</code>
    </p>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';

const model = reactive<{ price?: number[]; stock?: number[] }>({
  price: undefined,
  stock: undefined,
});

const submitted = ref('-');

const onSubmit = async () => {
  submitted.value = JSON.stringify(model);
  ElMessage.success('已提交');
};
</script>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.state {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-regular);
}
</style>
