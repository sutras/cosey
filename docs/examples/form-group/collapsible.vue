<template>
  <co-form-group title="基本信息" collapsible v-model:collapsed="collapsed.basic">
    <co-form-item v-model="model.name" label="姓名" width="sm" />
    <co-form-item v-model="model.mobile" label="手机号" width="sm" />
  </co-form-group>

  <co-form-group title="高级设置" collapsible v-model:collapsed="collapsed.advanced">
    <co-form-item v-model="model.timeout" label="超时时间" width="sm" />
    <co-form-item v-model="model.retry" label="重试次数" width="sm" />
  </co-form-group>

  <el-space>
    <el-button @click="collapsed.advanced = !collapsed.advanced">切换「高级设置」</el-button>
    <el-button @click="collapseAll">全部收起</el-button>
  </el-space>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';

const model = reactive({
  name: '',
  mobile: '',
  timeout: '',
  retry: '',
});

// collapsed 支持 v-model:collapsed，所以折叠状态也可以完全交给外部控制
const collapsed = reactive({
  basic: false,
  advanced: true,
});

const collapseAll = () => {
  collapsed.basic = true;
  collapsed.advanced = true;
};
</script>
