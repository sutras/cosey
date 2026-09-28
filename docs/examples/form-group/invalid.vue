<template>
  <co-form :model="formModel" :submit="onSubmit" label-width="auto">
    <co-form-group title="基本信息" collapsible v-model:collapsed="collapsed.basic">
      <co-form-item v-model="formModel.name" prop="name" label="姓名" width="sm" required />
      <co-form-item v-model="formModel.mobile" prop="mobile" label="手机号" width="sm" />
    </co-form-group>

    <co-form-group title="紧急联系人" collapsible v-model:collapsed="collapsed.emergency">
      <co-form-item v-model="formModel.contact" prop="contact" label="联系人" width="sm" required />
      <co-form-item v-model="formModel.contactTel" prop="contactTel" label="联系电话" width="sm" />
    </co-form-group>
  </co-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { ElMessage } from 'element-plus';

const formModel = reactive({
  name: '',
  mobile: '',
  contact: '',
  contactTel: '',
});

// 第二个分组默认是收起的，提交后会自动展开
const collapsed = reactive({
  basic: false,
  emergency: true,
});

const onSubmit = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  ElMessage.success('校验通过');
};
</script>
