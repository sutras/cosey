<template>
  <el-button type="primary" @click="add()">新增</el-button>
  <el-button
    type="primary"
    @click="
      edit({
        name: '张三',
        mobile: '13800138000',
      })
    "
  >
    编辑
  </el-button>

  <co-form-dialog v-bind="dialogProps" width="lg">
    <co-form v-bind="formProps" v-loading="loading" label-width="auto" width="md">
      <co-form-group>
        <co-form-item v-model="model.nickname" prop="nickname" label="昵称" />
        <co-form-item v-model="model.mobile" prop="mobile" label="手机号" required />
        <co-form-item v-model="model.name" prop="name" label="姓名" required />
        <co-form-item
          v-model="model.gender"
          prop="gender"
          label="性别"
          field-type="radiogroup"
          :field-props="{
            options: mock.genders,
          }"
        />
        <co-form-item v-model="model.birthday" prop="birthday" label="生日" field-type="date" />
        <co-form-item
          v-model="model.constellation"
          prop="constellation"
          label="星座"
          field-type="select"
          :field-props="{ options: mock.zodiacSigns }"
        />
        <co-form-item v-model="model.height" prop="height" label="身高(cm)" />
        <co-form-item v-model="model.weight" prop="weight" label="体重(kg)" />
        <co-form-item
          v-model="model.qualification"
          prop="qualification"
          label="学历"
          field-type="select"
          :field-props="{ options: mock.qualifications }"
        />
        <co-form-item
          v-model="model.trait"
          prop="trait"
          label="特质"
          field-type="select"
          :field-props="{ options: mock.traits }"
        />
        <co-form-item
          v-model="model.friendshipType"
          prop="friendshipType"
          label="交友类型"
          field-type="select"
          :field-props="{ options: mock.friendshipTypes }"
        />
        <co-form-item v-model="model.signature" prop="signature" label="个性签名" />
      </co-form-group>
      <co-form-item
        v-model="model.hobbies"
        prop="hobbies"
        label="爱好"
        width="auto"
        field-type="checkboxgroup"
        :field-props="{ options: mock.hobbies, max: 4 }"
      />
      <co-form-item
        v-model="model.avatar"
        prop="avatar"
        label="头像"
        width="md"
        field-type="upload"
        :field-props="{ single: true }"
      />
    </co-form>
  </co-form-dialog>
</template>

<script lang="ts" setup>
import { useUpsert } from 'cosey/hooks';
import { reactive } from 'vue';
import * as mock from '@gunny/mock';

interface Model {
  nickname?: string;
  mobile?: string;
  name?: string;
  gender?: string;
  birthday?: string;
  constellation?: string;
  height?: string;
  weight?: string;
  qualification?: string;
  trait?: string;
  friendshipType?: string;
  hobbies?: string[];
  signature?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

const model = reactive<Model>({
  nickname: undefined,
  mobile: undefined,
  name: undefined,
  gender: undefined,
  birthday: undefined,
  constellation: undefined,
  height: undefined,
  weight: undefined,
  qualification: undefined,
  trait: undefined,
  friendshipType: undefined,
  hobbies: undefined,
  signature: undefined,
  avatar: undefined,
});

const { dialogProps, formProps, edit, add, expose, loading } = useUpsert({
  stuffTitle: '用户',
  model,
  addFetch: () => new Promise((resolve) => setTimeout(resolve, 300)),
  editFetch: () => new Promise((resolve) => setTimeout(resolve, 300)),
});

defineExpose(expose);
</script>
