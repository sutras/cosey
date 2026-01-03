import { computed, ref, shallowRef } from 'vue';
import { type RouteRecordRaw } from 'vue-router';
import { defineStore, type StoreGeneric } from 'pinia';
import { defineRoutes, getAllDynamicRoutes, router } from '../router';
import { TOKEN_NAME } from '../constant';
/**
 * 用于解决ts错误提示：
 * The inferred type of '' cannot be named without a reference to '.pnpm/@vue+shared@3.5.13/node_modules/@vue/shared'. This is likely not portable. A type annotation is necessary.
 */
import type {} from '@vue/shared';
import { warningOnce } from '../utils';
import { NOT_FOUND_ROUTE_NAME, NotFoundRoute } from '../router/not-found';
import { persist } from '../persist';
import { pinia } from './pinia';
import { globalConfig } from '../config';

export interface UserInfo {
  nickname: string;
  avatar: string;
  [key: PropertyKey]: any;
}

export const useUserStore = defineStore('cosey-user', () => {
  const {
    router: routerConfig,
    api: apiConfig,
    filterRoute,
    initializeData: _initializeData,
  } = globalConfig;

  if (!apiConfig?.login) {
    warningOnce(!!apiConfig?.login, 'The "login" api is required.');
  }
  const loginApi = apiConfig?.login;
  const changePasswordApi = apiConfig?.changePassword;
  const logoutApi = apiConfig?.logout;

  // 当前动态添加的路由
  const dynamicRoutes = shallowRef<any[]>([]);
  // 远程动态路由
  const remoteDynamicRoutes = shallowRef<any[]>([]);
  // 当前登录用户的信息
  const userInfo = ref<UserInfo>();
  // 是否已初始化数据
  const initialized = ref(false);

  /**
   * 登录获取用户 token
   * 会保存 token 到硬盘，每次刷新页面会复用此 token
   */
  const login = async (data: any) => {
    await loginApi?.(data).then((token: string) => {
      persist.set(TOKEN_NAME, token);
      router.push((router.currentRoute.value.query.redirect as string) || routerConfig!.homePath);
    });
  };

  const mapRoute = (routes: RouteRecordRaw[]): RouteRecordRaw[] => {
    return routes
      .map((route) => {
        const result = filterRoute(route);
        const node = result === true ? route : result;

        if (node && node.children && node.children.length) {
          node.children = mapRoute(node.children);
        }
        return node;
      })
      .filter(Boolean) as RouteRecordRaw[];
  };

  /**
   * 根据用户权限过滤路由
   */
  const filterRoutes = (routes: RouteRecordRaw[]) => {
    return mapRoute(routes);
  };

  /**
   * 获取用户信息、设置权限后，添加动态路由
   */
  const addDynamicRoutes = async () => {
    const filteredRoutes = filterRoutes([...getAllDynamicRoutes(), ...remoteDynamicRoutes.value]);

    router.removeRoute(NOT_FOUND_ROUTE_NAME);
    filteredRoutes.forEach((route) => {
      router.addRoute(route as RouteRecordRaw);
    });
    router.addRoute('Exception', NotFoundRoute as RouteRecordRaw);

    dynamicRoutes.value = filteredRoutes;
  };

  /**
   * 初始化用户相关数据
   */
  const initializeData = async () => {
    const setUserInfo = (_userInfo: UserInfo) => {
      userInfo.value = _userInfo;
    };

    const setRoutes = (route: RouteRecordRaw | RouteRecordRaw[]) => {
      remoteDynamicRoutes.value = defineRoutes(route);
    };

    if (!initialized.value) {
      await _initializeData({
        setUserInfo,
        setRoutes,
      });
      await addDynamicRoutes();
      initialized.value = true;
    }
  };

  /**
   * 修改密码
   */
  const changePassword = async (data: any) => {
    await changePasswordApi?.(data).then(() => {
      router.back();
    });
  };

  /**
   * 退出登录时清空用户信息
   */
  const flush = async (lastPath?: string) => {
    persist.remove(TOKEN_NAME);
    userInfo.value = undefined;
    dynamicRoutes.value.forEach((route) => {
      router.removeRoute(route.name!);
    });
    dynamicRoutes.value = [];
    remoteDynamicRoutes.value = [];
    initialized.value = false;
    await router.push({
      path: routerConfig!.loginPath,
      query: {
        redirect: lastPath,
      },
    });
  };

  /**
   * 退出登录
   */
  const logout = async (lastPath?: string) => {
    await logoutApi?.();
    await flush(lastPath);
  };

  return {
    dynamicRoutes,
    userInfo,
    initialized: computed(() => initialized.value),
    login,
    initializeData,
    changePassword,
    logout,
  };
});

export const useOuterUserStore = (hot?: StoreGeneric) => {
  return useUserStore(pinia, hot);
};
