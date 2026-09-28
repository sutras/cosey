<template>
  <el-checkbox v-model="withExtra">显示「第二步（可选）」</el-checkbox>

  <co-form :model="formModel" :submit="onSubmit" label-position="top" width="md">
    <co-form-steps>
      <co-form-step title="第一步">
        <co-form-item v-model="formModel.name" prop="name" label="姓名" required />
      </co-form-step>

      <co-form-step v-if="withExtra" title="第二步（可选）">
        <co-form-item v-model="formModel.extra" prop="extra" label="补充信息" required />
      </co-form-step>

      <co-form-step title="最后一步">
        <co-form-item v-model="formModel.remark" prop="remark" label="备注" field-type="textarea" />
      </co-form-step>
    </co-form-steps>
  </co-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';

const withExtra = ref(true);

const formModel = reactive({
  name: '',
  extra: '',
  remark: '',
});

async function onSubmit() {
  await new Promise((resolve) => setTimeout(resolve, 300));
  ElMessage.success('提交成功');
}
</script>
