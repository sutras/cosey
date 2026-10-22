import { type App } from 'vue';

import { launchRouter } from './router';
import { type CoseyOptions, launchGlobalConfig } from './config';
import { launchStore } from './store';
import { isClient } from './utils';
import ElementPlus from 'element-plus';
import { registerGlobalComponents } from './components/index';

import { Http, createHttp, http } from './request';

import { defineRoute, defineRoutes, mergeRouteModules, router } from './router';
import {
  type UserInfo,
  pinia,
  piniaPluginPersist,
  useUserStore,
  useOuterUserStore,
  useLayoutStore,
  useOuterLayoutStore,
} from './store';
export { type CoseyOptions, type LayoutComponents, type LayoutSlots } from './config';
import { persist } from './persist';
import { i18n } from './locale';

function launchGlobalComponents(app: App) {
  app.use(ElementPlus);
  app.use(registerGlobalComponents);
}

function launch(app: App, options: CoseyOptions = {}) {
  // 路由
  launchRouter(app, options.router);

  // 全局状态管理
  launchStore(app);

  // 全局组件
  launchGlobalComponents(app);

  // 全局配置，仅非ssr
  if (isClient()) {
    launchGlobalConfig(app, options);
  }
}

export * from './layout/layout';

// dict
export * from './dict';

export {
  // components
  registerGlobalComponents,

  // http
  Http,
  createHttp,
  http,

  // router
  defineRoute,
  defineRoutes,
  mergeRouteModules,
  router,

  // persist
  persist,

  // i18n
  i18n,

  // store
  type UserInfo,
  pinia,
  piniaPluginPersist,
  useUserStore,
  useOuterUserStore,
  useLayoutStore,
  useOuterLayoutStore,

  // launch
  launch,
};
