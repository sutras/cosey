<template>
  <el-checkbox v-model="showExtra" class="mb-4">显示「附加信息」页签</el-checkbox>

  <co-form :model="formModel" :submit="onSubmit" label-position="top" width="md">
    <co-form-tabs>
      <co-form-tab-panel label="基础信息" name="basic">
        <co-form-item v-model="formModel.name" prop="name" label="姓名" required />
      </co-form-tab-panel>
      <co-form-tab-panel v-if="showExtra" label="附加信息" name="extra">
        <co-form-item v-model="formModel.extra" prop="extra" label="备注" required />
      </co-form-tab-panel>
      <co-form-tab-panel label="账号信息" name="account">
        <co-form-item v-model="formModel.account" prop="account" label="账号" required />
      </co-form-tab-panel>
    </co-form-tabs>
  </co-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';

const showExtra = ref(true);

const formModel = reactive({
  name: '',
  extra: '',
  account: '',
});

function onSubmit() {
  ElMessage.success('提交成功');
}
</script>
