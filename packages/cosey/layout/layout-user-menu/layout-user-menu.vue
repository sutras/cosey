<template>
  <el-dropdown placement="bottom" trigger="click">
    <el-button link :class="bem.b()">
      <el-avatar :size="32" :src="userStore.userInfo?.avatar">
        <Icon><RtiUser /></Icon>
      </el-avatar>
      <span :class="bem.e('name')">
        {{ userStore.userInfo?.nickname }}
      </span>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu :class="[bem.e('dropdown')]">
        <el-dropdown-item @click="toHome">
          <Icon size="lg"><RtiHome /></Icon>
          <span :class="bem.e('item-title')">{{ t('co.common.home') }}</span>
        </el-dropdown-item>

        <component :is="UserMenu" />

        <el-dropdown-item v-if="apiConfig.changePassword" @click="toChangePassword">
          <Icon size="lg"><RtiPassword /></Icon>
          <span :class="bem.e('item-title')">{{ t('co.auth.changePassword') }}</span>
        </el-dropdown-item>
        <el-dropdown-item divided @click="logout">
          <Icon size="lg"><RtiLogout /></Icon>
          <span :class="bem.e('item-title')">{{ t('co.auth.logout') }}</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useGlobalConfig } from '../../config';
import { useUserStore } from '../../store';
import { Icon } from '../../components';

import { defineTemplate } from '../../utils';
import { useLocale } from '../../hooks';
import { ref } from 'vue';
import { ElLoading } from 'element-plus';
import { createBem } from '../../utils';
import { RtiHome, RtiLogout, RtiPassword, RtiUser } from 'richtext-icons';

defineOptions({
  name: 'CoLayoutUserMenu',
});

const { t } = useLocale();

const bem = createBem('layout-user-menu');

const router = useRouter();

const userStore = useUserStore();

const { router: routerConfig, slots: slotsConfig, api: apiConfig } = useGlobalConfig();

const UserMenu = defineTemplate(() => slotsConfig.userMenu?.());

// to home
const toHome = () => {
  router.push(routerConfig.homePath);
};

// change-password
const toChangePassword = () => {
  router.push(routerConfig.changePasswordPath);
};

// logout
const fullscreenLoading = ref(false);

const logout = () => {
  if (fullscreenLoading.value) return;

  fullscreenLoading.value = true;

  const loading = ElLoading.service({
    lock: true,
    text: t('co.auth.loggingOut'),
  });

  userStore.logout(router.currentRoute.value.fullPath).finally(() => {
    fullscreenLoading.value = false;
    loading.close();
  });
};
</script>
