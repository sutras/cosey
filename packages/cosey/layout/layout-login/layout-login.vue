<template>
  <div :class="bem.b()">
    <div :class="bem.e('title')">{{ t('co.auth.login') }}</div>
    <el-form ref="formRef" :model="formState" @keyup.enter.prevent="onSubmit">
      <el-form-item
        prop="username"
        :rules="[{ required: true, message: t('co.auth.enterUsername') }]"
      >
        <el-input v-model="formState.username" size="large" :placeholder="t('co.auth.username')">
          <template #prefix>
            <co-icon :class="bem.e('icon')"><RtiUser /></co-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item
        prop="password"
        :rules="[{ required: true, message: t('co.auth.enterPassword') }]"
      >
        <el-input
          v-model="formState.password"
          type="password"
          show-password
          size="large"
          :placeholder="t('co.auth.password')"
        >
          <template #prefix>
            <co-icon :class="bem.e('icon')"><RtiPassword /></co-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item
        v-if="withCaptcha"
        prop="captcha"
        :rules="[{ required: true, message: t('co.auth.enterCaptcha') }]"
      >
        <div :class="bem.e('captcha-wrapper')">
          <el-input
            v-model="formState.captcha"
            style="width: 100%"
            size="large"
            :placeholder="t('co.auth.captcha')"
          >
            <template #prefix>
              <co-icon :class="bem.e('icon')"><RtiCaptcha /></co-icon>
            </template>
          </el-input>
          <img :class="bem.e('captcha')" :src="captchaUrl" @click="getCaptcha" />
        </div>
      </el-form-item>

      <el-button
        size="large"
        type="primary"
        :class="bem.e('button')"
        :loading="loading"
        @click="onSubmit"
      >
        {{ t('co.auth.login') }}
      </el-button>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { type FormInstance, ElButton } from 'element-plus';
import { useUserStore } from '../../store';
import { computed, reactive, ref, useTemplateRef, onMounted } from 'vue';
import { useLocale } from '../../hooks';
import { type LoginFormModel, useGlobalConfig } from '../../config';
import { warningOnce } from '../../utils';
import { createBem } from '../../utils';
import { RtiCaptcha, RtiPassword, RtiUser } from 'richtext-icons';

const { t } = useLocale();

const bem = createBem('layout-login');

const { auth: authConfig, api: apiConfig } = useGlobalConfig();

// ============================ captcha ============================

const withCaptcha = computed(() => authConfig.captcha);

const captchaUrl = ref('');

const userStore = useUserStore();

if (withCaptcha.value) {
  warningOnce(!!apiConfig?.captcha, 'The "captcha" api is required.');
}

const captchaLoading = ref(false);

function getCaptcha() {
  if (captchaLoading.value || !withCaptcha.value) return;
  captchaLoading.value = true;
  apiConfig.captcha!({})
    .then((res) => {
      captchaUrl.value = res.image;
      formState.captchaId = res.id;
    })
    .finally(() => {
      captchaLoading.value = false;
    });
}

onMounted(() => {
  getCaptcha();
});

// ============================ form ============================

const formState = reactive<LoginFormModel>({
  username: '',
  password: '',
  captcha: undefined,
  captchaId: undefined,
});

const formRef = useTemplateRef<FormInstance>('formRef');

const loading = ref(false);

const onSubmit = () => {
  if (loading.value) return;

  formRef.value
    ?.validate()
    .then(() => {
      loading.value = true;
      userStore.login(formState).finally(() => {
        loading.value = false;
      });
    })
    .catch(() => {
      getCaptcha();
    });
};
</script>
