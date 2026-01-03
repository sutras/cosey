import { type App, type Component, type InjectionKey, type VNodeChild, inject } from 'vue';
import { defaultsDeep } from 'lodash-es';

import { type RouterConfig, type RequiredRouterConfig, defaultRouterConfig } from './router';
import { type LayoutConfig, type RequiredLayoutConfig, defaultLayoutConfig } from './layout';
import { type SiteConfig, type RequiredSiteConfig, defaultSiteConfig } from './site';
import { type HttpConfig, type RequiredHttpConfig, defaultHttpConfig } from './http';
import { type ApiConfig, type RequiredApiConfig, defaultApiConfig } from './api';
import { type PersistConfig } from './persist';
import { type I18nConfig } from './i18n';

import { type RouteRecordRaw } from 'vue-router';
import { type CoseyRouterOptions } from '../router';
import { launchLocale } from '../locale';
import { launchPersist } from '../persist';
import { type UserInfo } from '../store';

export interface LayoutComponents {
  base?: string | Component;
  sidebar?: string | Component;
  snugAside?: string | Component;
  snugMenu?: string | Component;
  aside?: string | Component;
  menu?: string | Component;
  mask?: string | Component;
  content?: string | Component;
  header?: string | Component;
  topbar?: string | Component;
  brand?: string | Component;
  toggle?: string | Component;
  topSnugMenu?: string | Component;
  breadcrumb?: string | Component;
  search?: string | Component;
  colorScheme?: string | Component;
  user?: string | Component;
  tabbar?: string | Component;
  main?: string | Component;
  iframe?: string | Component;
  switchEffect?: string | Component;
  auth?: string | Component;
  login?: string | Component;
  changePassword?: string | Component;
  exception?: string | Component;
  forbidden?: string | Component;
  notFound?: string | Component;
  internalServerError?: string | Component;
  empty?: string | Component;
  locale?: string | Component;
}

export interface LayoutSlots {
  topbarRight?: () => VNodeChild;
  topbarWidget?: () => VNodeChild;
  authWidget?: () => VNodeChild;
  userMenu?: () => VNodeChild;
  afterToggle?: () => VNodeChild;
}

type FilterRouteHandler = (
  route: RouteRecordRaw,
) => RouteRecordRaw | void | boolean | undefined | null;

type InitializeDataHandler = (handlers: {
  setUserInfo: (userInfo: UserInfo) => void;
  setRoutes: (route: RouteRecordRaw | RouteRecordRaw[]) => void;
}) => void | Promise<void>;

export type CoseyOptions = {
  router?: CoseyRouterOptions & RouterConfig;
  http?: HttpConfig;
  layout?: LayoutConfig;
  site?: SiteConfig;
  api?: ApiConfig;
  initializeData?: InitializeDataHandler;
  filterRoute?: FilterRouteHandler;
  components?: LayoutComponents;
  slots?: LayoutSlots;
  persist?: PersistConfig;
  i18n?: I18nConfig;
};

export interface GlobalConfig {
  router: RequiredRouterConfig;
  http: RequiredHttpConfig;
  layout: RequiredLayoutConfig;
  site: RequiredSiteConfig;
  api: RequiredApiConfig;
  initializeData: NonNullable<CoseyOptions['initializeData']>;
  filterRoute: NonNullable<CoseyOptions['filterRoute']>;
  components: NonNullable<CoseyOptions['components']>;
  slots: NonNullable<CoseyOptions['slots']>;
}

const globalConfigContextKey = Symbol('globalConfigContext') as InjectionKey<GlobalConfig>;

export let globalConfig: GlobalConfig;

export function launchGlobalConfig(app: App, options: CoseyOptions) {
  const {
    router: { homePath, loginPath, changePasswordPath } = {},
    http = {},
    layout = {},
    site = {},
    api = {},
    initializeData = () => void 0,
    filterRoute = () => true,
    components = {},
    slots = {},
    persist = {},
    i18n = {},
  } = options;

  globalConfig = {
    router: defaultsDeep({ homePath, loginPath, changePasswordPath }, defaultRouterConfig),
    http: defaultsDeep(http, defaultHttpConfig),
    layout: defaultsDeep(layout, defaultLayoutConfig),
    site: defaultsDeep(site, defaultSiteConfig),
    api: defaultsDeep(api, defaultApiConfig),
    initializeData,
    filterRoute,
    components,
    slots,
  };

  app.provide(globalConfigContextKey, globalConfig);

  launchPersist(persist);

  launchLocale(app, i18n);
}

export function useGlobalConfig() {
  return inject(globalConfigContextKey, {} as GlobalConfig);
}
