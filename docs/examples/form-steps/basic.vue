<template>
  <co-form :model="formModel" :submit="onSubmit" label-position="top" width="md">
    <co-form-steps>
      <co-form-step title="基本信息" description="填写申请人的基本信息">
        <co-form-item v-model="formModel.name" prop="name" label="姓名" required />
        <co-form-item v-model="formModel.mobile" prop="mobile" label="手机号" required />
      </co-form-step>

      <co-form-step title="账号信息" description="设置登录用的账号">
        <co-form-item v-model="formModel.account" prop="account" label="账号" required />
        <co-form-item
          v-model="formModel.password"
          prop="password"
          label="密码"
          field-type="password"
          required
        />
      </co-form-step>

      <co-form-step title="补充说明" description="可以在这里留点备注">
        <co-form-item v-model="formModel.remark" prop="remark" label="备注" field-type="textarea" />
      </co-form-step>
    </co-form-steps>
  </co-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { ElMessage } from 'element-plus';

const formModel = reactive({
  name: '',
  mobile: '',
  account: '',
  password: '',
  remark: '',
});

async function onSubmit() {
  await new Promise((resolve) => setTimeout(resolve, 300));
  ElMessage.success('提交成功');
}
</script>
