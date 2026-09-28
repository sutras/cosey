<template>
  <co-form :model="formModel" :submit="onSubmit" label-position="top" width="md">
    <co-form-tabs>
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
import { reactive } from 'vue';
import { ElMessage } from 'element-plus';

const formModel = reactive({
  name: '',
  mobile: '',
  age: undefined as number | undefined,
  account: '',
  password: '',
});

function onSubmit() {
  ElMessage.success('提交成功');
}
</script>
