<template>
  <div>
    <co-form-query
      ref="formQueryRef"
      :model="model"
      :schemes="schemes"
      :collapsed="false"
      :submit="onSubmit"
    >
      <co-form-item
        v-model="model.updatedAt"
        prop="updatedAt"
        label="更新时间"
        field-type="daterange"
        :field-props="{ valueFormat: 'YYYY-MM-DD' }"
        :split="['startUpdatedAt', 'endUpdatedAt']"
      />
    </co-form-query>

    <div style="margin-bottom: 12px">
      <el-button @click="onRead">读取当前筛选值</el-button>
      <el-button @click="onPreset">按两个键预填</el-button>
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
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { type FormQueryExpose, type FormQueryScheme } from 'cosey/components';

const formQueryRef = ref<FormQueryExpose>();

const value = ref('');

const model = reactive<Record<string, any>>({
  keyword: '',
  createdAt: undefined,
  updatedAt: undefined,
});

// 模型里只存源字段的数组，`split` 只影响 `getFieldsValue()` 的输出
const schemes: FormQueryScheme[] = [
  {
    prop: 'keyword',
    label: '关键词',
    fieldType: 'input',
  },
  {
    prop: 'createdAt',
    label: '创建时间',
    fieldType: 'daterange',
    fieldProps: { valueFormat: 'YYYY-MM-DD' },
    split: ['startCreatedAt', 'endCreatedAt'],
  },
];

const onSubmit = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  ElMessage.success('已查询');
};

const onRead = () => {
  value.value = JSON.stringify(formQueryRef.value?.getFieldsValue(), null, 2);
};

// 写入是反向的：给拆开的两个键会合成回源字段
const onPreset = () => {
  formQueryRef.value?.setFieldsValue({
    startCreatedAt: '2024-01-01',
    endCreatedAt: '2024-03-31',
    startUpdatedAt: '2024-02-01',
    endUpdatedAt: '2024-02-29',
  });
};
</script>
