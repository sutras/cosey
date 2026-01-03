import '@/styles/index.css';
import '@/styles/override-element-plus.scss';

import { createApp } from 'vue';
import { launch } from 'cosey';
import App from '@/App.vue';
import { dynamicRoutes, staticRoutes } from '@/routes';
import commonApi from '@/api/common';
import authApi from '@/api/rbac/auth';

import { AbilityBuilder, createMongoAbility, defineAbility } from '@casl/ability';
import { ABILITY_TOKEN } from '@casl/vue';

import LayoutSetting from '@/components/layout-setting';
import LayoutHttpMessage from '@/components/layout-http-message';
import LoginTips from '@/components/login-tips.vue';

import { i18nConfig } from '@/locale';

import 'virtual:svg-icons-register';
import { icons as carbonIcons } from '@iconify-json/carbon';
import { addIconifyIcon } from 'cosey/components';

import { createMock } from '@cosey/mock';
import { createWebHashHistory } from 'vue-router';

addIconifyIcon('carbon', carbonIcons);

async function bootstrap() {
  const app = createApp(App);

  // 权限
  const ability = defineAbility(() => {});
  ability.can = ability.can.bind(ability);
  ability.cannot = ability.cannot.bind(ability);
  app.provide(ABILITY_TOKEN, ability);

  // cosey
  launch(app, {
    router: { dynamic: dynamicRoutes, static: staticRoutes, history: createWebHashHistory() },
    http: {
      baseURL: import.meta.env.VITE_BASE_URL,
    },
    site: {
      name: import.meta.env.VITE_APP_TITLE,
      logo: import.meta.env.VITE_APP_LOGO,
      description: import.meta.env.VITE_APP_DESCRIPTION,
    },
    i18n: i18nConfig,
    api: {
      upload: commonApi.singleUpload,
      login: authApi.login,
      changePassword: authApi.changePassword,
    },
    async initializeData({ setUserInfo, setRoutes }) {
      const userInfo = await authApi.getUserInfo();
      setUserInfo(userInfo);
      setRoutes([]);

      const { can, rules } = new AbilityBuilder(createMongoAbility);
      userInfo.permissions.forEach(({ action, subject }: any) => {
        can(action, subject);
      });
      ability.update(rules);
    },
    filterRoute(route) {
      const authority = route.meta?.authority;
      return !authority ? true : authority(ability);
    },
    slots: {
      topbarWidget() {
        return (
          <>
            <LayoutSetting />
            <LayoutHttpMessage />
          </>
        );
      },
      authWidget() {
        return (
          <>
            <LoginTips />
            <LayoutSetting />
            <LayoutHttpMessage />
          </>
        );
      },
    },
  });

  // 请求拦截
  const mock = createMock({
    requestInterceptorInit: {
      network: {
        uplink: 100 * 1024,
        downlink: 100 * 1024,
      },
    },
  });
  mock.intercept();
  app.provide('mockContext', mock.httpMessageManager);

  // 挂载根组件
  app.mount('#app');
}

bootstrap();
