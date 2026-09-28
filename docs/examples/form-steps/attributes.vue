<template>
  <el-space direction="vertical" alignment="flex-start">
    <el-button-group>
      <el-button
        v-for="(title, index) in stepTitles"
        :key="title"
        :type="current === index ? 'primary' : ''"
        @click="current = index"
      >
        {{ title }}
      </el-button>
    </el-button-group>

    <el-space>
      <el-checkbox v-model="simple">simple</el-checkbox>
      <el-checkbox v-model="clickable">clickable</el-checkbox>
    </el-space>
  </el-space>

  <co-form :model="formModel" :submit="onSubmit" label-position="top" width="md">
    <!--
      v-model 是受控的：外面的按钮组也能切步骤。
      clickable 关掉之后，只能靠外部按钮切换。
    -->
    <co-form-steps v-model="current" :simple="simple" :clickable="clickable" :body-min-height="160">
      <co-form-step title="基本信息">
        <co-form-item v-model="formModel.name" prop="name" label="姓名" />
      </co-form-step>

      <co-form-step title="联系方式">
        <co-form-item v-model="formModel.mobile" prop="mobile" label="手机号" />
      </co-form-step>

      <co-form-step title="备注">
        <co-form-item v-model="formModel.remark" prop="remark" label="备注" field-type="textarea" />
      </co-form-step>
    </co-form-steps>
  </co-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';

const stepTitles = ['基本信息', '联系方式', '备注'];

const current = ref(0);
const simple = ref(false);
const clickable = ref(true);

const formModel = reactive({
  name: '',
  mobile: '',
  remark: '',
});

async function onSubmit() {
  await new Promise((resolve) => setTimeout(resolve, 300));
  ElMessage.success('提交成功');
}
</script>
