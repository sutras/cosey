<template>
  <co-form-query :model="formModel" :submit="onSubmit">
    <co-form-item v-model="formModel.name" prop="name" label="签约客户名称" field-type="input" />
    <co-form-item
      v-model="formModel.company"
      prop="company"
      label="我方公司名称"
      field-type="input"
    />
    <co-form-item
      v-model="formModel.contract.name"
      prop="contract.name"
      label="合同名称"
      field-type="input"
      required
    />
    <co-form-item
      v-model="formModel.contract.createTime"
      prop="contract.createTime"
      label="合同生效时间"
      field-type="daterange"
    />
    <co-form-item v-model="formModel.id" prop="id" label="主合同编号" field-type="input" />
    <co-form-item v-model="formModel.project" prop="project" label="项目名称" field-type="input" />
    <co-form-item
      v-model="formModel.mangerName"
      prop="mangerName"
      label="商务经理"
      field-type="input"
    />
    <co-form-item
      v-model="formModel.department"
      prop="department"
      label="负责部门"
      field-type="input"
    />
  </co-form-query>
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus';
import { reactive } from 'vue';

// 收起时被隐藏的字段仍然参与校验（只是 display:none），
// 点「查询」时表单会自动展开到能看见出错字段
const formModel = reactive({
  name: undefined,
  company: undefined,
  contract: {
    name: undefined,
    createTime: undefined,
  },
  id: undefined,
  project: undefined,
  mangerName: undefined,
  department: undefined,
});

const onSubmit = async () => {
  ElMessage.success('校验通过');
};
</script>
