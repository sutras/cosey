<template>
  <div>
    <co-form-query ref="formQueryRef" :schemes="schemes" :collapsed="false" :submit="onSubmit" />

    <div style="margin-bottom: 12px">
      <el-button @click="onRead">读取当前筛选值</el-button>
      <el-button @click="onPreset">把状态设为「禁用」并查询</el-button>
    </div>

    <pre
      style="
        margin: 0;
        padding: 12px;
        border-radius: 6px;
        font-size: 12px;
        line-height: 1.6;
        white-space: pre-wrap;
        word-break: break-all;
      "
      >{{ value || '（点上面的按钮看看模型里有什么）' }}</pre
    >
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { type FormQueryExpose, type FormQueryScheme } from 'cosey/components';

const formQueryRef = ref<FormQueryExpose>();

const value = ref('');

// 声明式字段：`modelValue` 就是初值，不用再手写 `v-model`，也不用自己维护 model
const schemes: FormQueryScheme[] = [
  {
    prop: 'keyword',
    label: '关键词',
    fieldType: 'input',
    modelValue: '',
  },
  {
    prop: 'status',
    label: '状态',
    fieldType: 'select',
    modelValue: '1',
    fieldProps: {
      clearable: true,
      options: [
        { label: '启用', value: '1' },
        { label: '禁用', value: '0' },
      ],
    },
  },
  {
    prop: 'createdAt',
    label: '创建时间',
    fieldType: 'daterange',
  },
];

const onSubmit = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  ElMessage.success('已查询');
};

const onRead = () => {
  value.value = JSON.stringify(formQueryRef.value?.getFieldsValue(), null, 2);
};

const onPreset = () => {
  formQueryRef.value?.setFieldsValue({ status: '0' });
  formQueryRef.value?.submit();
};
</script>
