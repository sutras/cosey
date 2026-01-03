<template>
  <el-dropdown placement="bottom" trigger="click">
    <el-button link :class="[hashId, prefixCls]">
      <el-avatar :size="32" :src="userStore.userInfo?.avatar">
        <Icon name="co:user" />
      </el-avatar>
      <span :class="`${prefixCls}-name`">
        {{ userStore.userInfo?.nickname }}
      </span>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu :class="[hashId, `${prefixCls}-dropdown`]">
        <el-dropdown-item @click="toHome">
          <Icon name="co:home" size="lg" />
          <span :class="`${prefixCls}-item-title`">{{ t('co.common.home') }}</span>
        </el-dropdown-item>

        <component :is="UserMenu" />

        <el-dropdown-item v-if="apiConfig.changePassword" @click="toChangePassword">
          <Icon name="co:password" size="lg" />
          <span :class="`${prefixCls}-item-title`">{{ t('co.auth.changePassword') }}</span>
        </el-dropdown-item>
        <el-dropdown-item divided @click="logout">
          <Icon name="co:logout" size="lg" />
          <span :class="`${prefixCls}-item-title`">{{ t('co.auth.logout') }}</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useGlobalConfig } from '../../config';
import { useUserStore } from '../../store';
import { Icon, useComponentConfig } from '../../components';

import useStyle from './style';
import { defineTemplate } from '../../utils';
import { useLocale } from '../../hooks';
import { ref } from 'vue';
import { ElLoading } from 'element-plus';

defineOptions({
  name: 'CoLayoutUserMenu',
});

const { t } = useLocale();

const { prefixCls } = useComponentConfig('layout-user-menu');

const { hashId } = useStyle(prefixCls);

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
