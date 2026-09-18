<template>
  <div :class="bem.b()">
    <div :class="bem.e('title')">{{ t('co.auth.changePassword') }}</div>
    <el-form ref="formRef" :model="formState" @keyup.enter.prevent="onSubmit">
      <el-form-item
        prop="oldPassword"
        :rules="[{ required: true, message: t('co.auth.enterCurrentPassword') }]"
      >
        <el-input
          v-model="formState.oldPassword"
          type="password"
          show-password
          size="large"
          :placeholder="t('co.auth.currentPassword')"
        >
          <template #prefix>
            <co-icon :class="bem.e('icon')"><RtiPassword /></co-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item
        prop="newPassword"
        :rules="[{ required: true, message: t('co.auth.enterNewPassword') }]"
      >
        <el-input
          v-model="formState.newPassword"
          type="password"
          show-password
          size="large"
          :placeholder="t('co.auth.newPassword')"
        >
          <template #prefix>
            <co-icon :class="bem.e('icon')"><RtiPassword /></co-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item
        prop="confirmNewPassword"
        :rules="[
          { required: true, message: t('co.auth.enterConfirmPassword') },
          {
            validator(_, value) {
              return value === formState.newPassword;
            },
            message: t('co.auth.passwordNotMatch'),
            trigger: 'blur',
          },
        ]"
      >
        <el-input
          v-model="formState.confirmNewPassword"
          type="password"
          show-password
          size="large"
          :placeholder="t('co.auth.confirmPassword')"
        >
          <template #prefix>
            <co-icon :class="bem.e('icon')"><RtiPassword /></co-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item>
        <el-button
          size="large"
          type="primary"
          :class="bem.e('button')"
          :loading="loading"
          @click="onSubmit"
        >
          {{ t('co.auth.changePassword') }}
        </el-button>
      </el-form-item>

      <el-form-item>
        <el-button size="large" :class="bem.e('button')" @click="router.back()">
          {{ t('co.common.back') }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../store';
import { ElMessage, type FormInstance, ElButton } from 'element-plus';
import { useLocale } from '../../hooks';
import { createBem } from '../../utils';
import { RtiPassword } from 'richtext-icons';

const { t } = useLocale();

const bem = createBem('layout-change-password');

const userStore = useUserStore();

const router = useRouter();

const formState = reactive({
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: '',
});

const formRef = useTemplateRef<FormInstance>('formRef');

const loading = ref(false);

const onSubmit = () => {
  if (loading.value) return;

  formRef.value?.validate().then(() => {
    loading.value = true;
    userStore
      .changePassword({
        oldPassword: formState.oldPassword,
        newPassword: formState.newPassword,
      })
      .then(() => {
        ElMessage.success(t('co.auth.loginAgain'));
        userStore.logout();
      })
      .catch(() => {})
      .finally(() => {
        loading.value = false;
      });
  });
};
</script>
