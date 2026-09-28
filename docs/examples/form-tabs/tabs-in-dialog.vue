<template>
  <el-button type="primary" @click="add()">新增用户</el-button>
  <el-button
    type="primary"
    @click="
      edit({
        name: '张三',
        mobile: '13800138000',
        account: 'zhangsan',
        role: 'admin',
      })
    "
  >
    编辑用户
  </el-button>

  <co-form-dialog v-bind="dialogProps" width="lg">
    <co-form v-bind="formProps" v-loading="loading" label-position="top" width="md">
      <co-form-tabs>
        <co-form-tab-panel label="基础信息" name="basic">
          <co-form-item v-model="model.name" prop="name" label="姓名" required />
          <co-form-item v-model="model.mobile" prop="mobile" label="手机号" required />
        </co-form-tab-panel>
        <co-form-tab-panel label="账号信息" name="account">
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
        </co-form-tab-panel>
      </co-form-tabs>
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
}

const model = reactive<Model>({
  name: undefined,
  mobile: undefined,
  account: undefined,
  role: undefined,
});

const { dialogProps, formProps, edit, add, expose, loading } = useUpsert({
  stuffTitle: '用户',
  model,
  addFetch: () => new Promise((resolve) => setTimeout(resolve, 300)),
  editFetch: () => new Promise((resolve) => setTimeout(resolve, 300)),
});

defineExpose(expose);
</script>
