<template>
  <el-button-group class="mb-4">
    <el-button @click="activeTab = 'basic'">切到基础信息</el-button>
    <el-button @click="activeTab = 'account'">切到账号信息</el-button>
  </el-button-group>

  <co-form :model="formModel" :submit="onSubmit" label-position="top" width="md">
    <co-form-tabs v-model="activeTab" tab-position="left">
      <co-form-tab-panel label="基础信息" name="basic">
        <co-form-item v-model="formModel.name" prop="name" label="姓名" required />
        <co-form-item v-model="formModel.mobile" prop="mobile" label="手机号" required />
        <co-form-item v-model="formModel.age" prop="age" label="年龄" field-type="number" />
      </co-form-tab-panel>
      <co-form-tab-panel label="账号信息" name="account">
        <co-form-item v-model="formModel.account" prop="account" label="账号" required />
        <co-form-item
          v-model="formModel.password"
          prop="password"
          label="密码"
          field-type="password"
          required
        />
      </co-form-tab-panel>
    </co-form-tabs>
  </co-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';

const activeTab = ref('basic');

const formModel = reactive({
  name: '',
  mobile: '',
  age: undefined as number | undefined,
  account: '',
  password: '',
});

function onSubmit() {
  ElMessage.success(`提交成功，当前页签：${activeTab.value}`);
}
</script>
