import { auid } from '../utils';
import { type RouteRecordRaw } from 'vue-router';

/**
 * 定义单个路由节点
 */
export function defineRoute(route: RouteRecordRaw) {
  function recur(route: RouteRecordRaw, index = 0, parent?: RouteRecordRaw): RouteRecordRaw {
    const meta = route.meta || {};

    const newRoute = {
      ...route,
      name: route.name || auid(),
      meta: {
        ...meta,
        closable: meta.closable ?? true,
        keepAlive: meta.keepAlive ?? true,
        authentication: meta.authentication ?? true,
      },
    } as RouteRecordRaw;

    if (Array.isArray(route.children)) {
      newRoute.children = route.children.map((item, index) => recur(item, index, newRoute));
    }

    if (parent && !parent.redirect && index === 0) {
      parent.redirect = {
        name: newRoute.name,
      };
    }

    return newRoute;
  }

  return recur(route);
}

/**
 * 定义路由模块，可接收数组或对象，返回路由节点列表
 */
export function defineRoutes(route: RouteRecordRaw | RouteRecordRaw[]) {
  return (Array.isArray(route) ? route : [route]).map(defineRoute);
}

/**
 * 合并多个模块的路由
 */
export const mergeRouteModules = (modules: Record<string, unknown>) => {
  return Object.keys(modules).reduce((result, key) => {
    const module = ((modules[key] as Record<string, unknown>).default as RouteRecordRaw[]) || [];
    return result.concat(module);
  }, [] as RouteRecordRaw[]);
};
