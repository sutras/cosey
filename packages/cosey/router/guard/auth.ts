import { type Router } from 'vue-router';
import { globalConfig } from '../../config';
import { useUserStore } from '../../store';
import { ROUTER_TO, TOKEN_NAME } from '../../constant';
import { persist } from '../../persist';

/**
 * 身份验证路由守卫
 */
export function registerAuthGuard(router: Router) {
  router.beforeEach(async (to) => {
    const { router: routerConfig } = globalConfig;

    const token = persist.get(TOKEN_NAME);
    const userStore = useUserStore();

    // 在首页路由非 / 时访问 / 的情况下避免404
    if (to.path === '/' && routerConfig.homePath !== '/') {
      return routerConfig.homePath;
    }

    // 已登录
    if (token) {
      // 刚登录完或刷新页面时先初始化数据
      if (!userStore.initialized) {
        try {
          // 避免 token 过期获取不到当前路由
          persist.set(ROUTER_TO, to.fullPath);
          await userStore.initializeData();

          // 首次添加路由，需重新触发路由匹配，避免404
          return to.fullPath;
        } catch {
          return false;
        } finally {
          persist.remove(ROUTER_TO);
        }
      }

      // 不允许登录后访问登录页
      if (to.path === routerConfig.loginPath) {
        return routerConfig.homePath;
      }
    }

    // 未登录
    else {
      // 需认证路由跳转到登录页
      if (to.meta.authentication) {
        return {
          path: routerConfig.loginPath,
          query: {
            redirect: to.path,
          },
        };
      }
    }
  });
}
