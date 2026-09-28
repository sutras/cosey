<template>
  <el-button type="primary" @click="add()">新增用户</el-button>

  <co-form-dialog v-bind="dialogProps" width="lg">
    <co-form v-bind="formProps" v-loading="loading" label-position="top" width="md">
      <!-- 弹窗里不用自己写翻页按钮：底部的「确定」在前两步是「下一步」，并且会多出一个「上一步」 -->
      <co-form-steps>
        <co-form-step title="基础信息">
          <co-form-item v-model="model.name" prop="name" label="姓名" required />
          <co-form-item v-model="model.mobile" prop="mobile" label="手机号" required />
        </co-form-step>

        <co-form-step title="账号信息">
          <co-form-item v-model="model.account" prop="account" label="账号" required />
          <co-form-item
            v-model="model.role"
            prop="role"
            label="角色"
            field-type="select"
            :field-props="{
              options: [
                { label: '管理员', value: 'admin' },
                { label: '普通用户', value: 'user' },
              ],
            }"
            required
          />
        </co-form-step>

        <co-form-step title="备注">
          <co-form-item v-model="model.remark" prop="remark" label="备注" field-type="textarea" />
        </co-form-step>
      </co-form-steps>
    </co-form>
  </co-form-dialog>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { useUpsert } from 'cosey/hooks';

interface Model {
  name?: string;
  mobile?: string;
  account?: string;
  role?: string;
  remark?: string;
}

const model = reactive<Model>({
  name: undefined,
  mobile: undefined,
  account: undefined,
  role: undefined,
  remark: undefined,
});

const { dialogProps, formProps, add, expose, loading } = useUpsert({
  stuffTitle: '用户',
  model,
  addFetch: () => new Promise((resolve) => setTimeout(resolve, 300)),
});

defineExpose(expose);
</script>
