<template>
  <div>
    <el-radio-group v-model="layout" size="small" class="layout-switch">
      <el-radio-button value="top">组名在上</el-radio-button>
      <el-radio-button value="left">组名在左</el-radio-button>
    </el-radio-group>

    <co-form-query
      ref="formQueryRef"
      :schemes="schemes"
      :groups="groups"
      :group-layout="layout"
      :grid="false"
      inline
      label-width="auto"
      width="220px"
      :col-props="colProps"
      :collapsed="false"
      :submit="onSubmit"
    >
      <co-form-item prop="remark" label="备注" group="logistics" />
    </co-form-query>

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
      >{{ value || '（点「查询」看看模型里有什么）' }}</pre
    >
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
  type FormQueryExpose,
  type FormQueryGroup,
  type FormQueryGroupLayout,
  type FormQueryScheme,
} from 'cosey/components';

const formQueryRef = ref<FormQueryExpose>();

const value = ref('');

const layout = ref<FormQueryGroupLayout>('top');

// 组名占掉 96px 后每列会窄很多，左置时少排一列
const colProps = computed(() =>
  layout.value !== 'top'
    ? { xs: 24, sm: 12, md: 12, lg: 12, xl: 8, xxl: 8 }
    : { xs: 24, sm: 12, md: 8, lg: 6, xl: 6, xxl: 6 },
);

// 组定义只给名称与顺序；字段用 `group` 归组，没标的排在最后且不带组头
const groups: FormQueryGroup[] = [
  { name: 'basic', label: '基本信息' },
  { name: 'trade', label: '交易信息' },
  { name: 'logistics', label: '物流信息' },
];

const schemes: FormQueryScheme[] = [
  { prop: 'keyword', label: '关键词', group: 'basic', modelValue: '' },
  {
    prop: 'status',
    label: '状态',
    group: 'basic',
    fieldType: 'select',
    fieldProps: {
      clearable: true,
      options: [
        { label: '启用', value: '1' },
        { label: '禁用', value: '0' },
      ],
    },
  },
  { prop: 'createdAt', label: '下单时间', group: 'trade', fieldType: 'daterange' },
  {
    prop: 'payType',
    label: '支付方式',
    group: 'trade',
    fieldType: 'select',
    fieldProps: {
      options: [
        { label: '微信', value: 'wechat' },
        { label: '支付宝', value: 'alipay' },
      ],
    },
  },
  { prop: 'amountMin', label: '最小金额', group: 'trade', fieldType: 'number' },
  { prop: 'amountMax', label: '最大金额', group: 'trade', fieldType: 'number' },
  {
    prop: 'region',
    label: '收货地区',
    group: 'logistics',
    fieldType: 'select',
    fieldProps: {
      options: [
        { label: '华东', value: 'east' },
        { label: '华南', value: 'south' },
      ],
    },
  },
];

const onSubmit = async () => {
  value.value = JSON.stringify(formQueryRef.value?.getFieldsValue(), null, 2);
  ElMessage.success('已查询');
};
</script>

<style scoped>
.layout-switch {
  margin-bottom: 12px;
}
</style>
