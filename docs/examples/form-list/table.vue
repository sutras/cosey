<template>
  <co-form :model="formModel" label-width="auto" :submit="onSubmit">
    <co-form-item v-model="formModel.title" prop="title" label="报销单标题" width="md" required />
    <co-form-list
      v-model="formModel.items"
      prop="items"
      label="费用明细"
      layout="table"
      draggable
      :columns="columns"
      :default-value="defaultItem"
      :min="1"
      :max="5"
      add-text="添加一行"
      v-slot="{ row, getProp }"
    >
      <co-form-item v-model="row.name" :prop="getProp('name')" label="费用项" required />
      <co-form-item
        v-model="row.type"
        :prop="getProp('type')"
        label="类型"
        field-type="select"
        :field-props="{ options: types }"
        required
      />
      <co-form-item
        v-model="row.amount"
        :prop="getProp('amount')"
        label="金额"
        field-type="number"
        :field-props="{ min: 0, precision: 2, controls: false }"
        :rules="amountRules"
        required
      />
    </co-form-list>
  </co-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { type FormListColumn } from 'cosey/components';

const types = [
  { value: 'travel', label: '差旅费' },
  { value: 'meal', label: '餐费' },
  { value: 'office', label: '办公用品' },
];

const formModel = reactive<{
  title: string;
  items: {
    name: string;
    type: string;
    amount: number | undefined;
  }[];
}>({
  title: '上海出差报销',
  items: [
    { name: '高铁票', type: 'travel', amount: 553 },
    { name: '酒店', type: 'travel', amount: 1280 },
    { name: '工作餐', type: 'meal', amount: 88 },
  ],
});

// 列与默认插槽里的子节点按顺序一一对应，宽度可以用数字或 xs~xl 预设
const columns: FormListColumn[] = [
  { label: '费用项', width: 170, required: true },
  { label: '类型', width: 140, required: true },
  { label: '金额', width: 120, required: true },
];

const defaultItem = { name: '', type: 'travel', amount: undefined };

const amountRules = [
  { required: true, message: '请输入金额', trigger: 'change' },
  { type: 'number' as const, min: 0.01, message: '金额需大于 0', trigger: 'change' },
];

const onSubmit = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log(formModel);
  ElMessage.success('提交成功');
};
</script>
