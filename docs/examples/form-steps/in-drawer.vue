<template>
  <el-button type="primary" @click="visible = true">新建表单</el-button>

  <co-form-drawer v-model="visible" title="创建表单" size="lg">
    <co-form :model="formModel" :submit="onSubmit" label-position="top" width="md">
      <!-- Drawer 与 Dialog 走的是同一套底部按钮，用法完全一致 -->
      <co-form-steps>
        <co-form-step title="签约信息">
          <co-form-item v-model="formModel.name" prop="name" label="签约客户名称" required />
          <co-form-item v-model="formModel.company" prop="company" label="我方公司名称" />
        </co-form-step>

        <co-form-step title="合同信息">
          <co-form-item v-model="formModel.contract" prop="contract" label="合同名称" required />
          <co-form-item
            v-model="formModel.createTime"
            prop="createTime"
            label="合同生效时间"
            field-type="daterange"
          />
        </co-form-step>
      </co-form-steps>
    </co-form>
  </co-form-drawer>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';

const visible = ref(false);

const formModel = reactive({
  name: '',
  company: '',
  contract: '',
  createTime: undefined as string[] | undefined,
});

async function onSubmit() {
  await new Promise((resolve) => setTimeout(resolve, 300));
  ElMessage.success('提交成功');
}
</script>
