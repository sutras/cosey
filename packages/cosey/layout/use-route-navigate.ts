import { useRouter } from 'vue-router';
import { useLayoutStore } from '../store';

/**
 * 按路由名「打开」一个页面，菜单 / 搜索等切换路由的入口统一走它。
 *
 * ⚠️ 不要直接 `router.push({ name })`：这样只带了 name，会把该页面标签页里记录过的
 * query / params 抹掉（例如从列表页带筛选条件跳到详情页，再从菜单切回来时筛选条件就没了，
 * 并且标签页记录的地址也会被改写）。
 *
 * 这里与点击标签页的行为保持一致：优先按标签页记录的完整地址（`fullPath`）跳转，
 * 没有记录（该页面还没打开过）时才退回按 name 跳转。
 *
 * 目标地址和当前地址完全相同时，vue-router 会判定为重复导航（`NAVIGATION_DUPLICATED`），
 * 不会重新挂载页面，所以重复点击当前菜单项是安全的。
 *
 * ```ts
 * const navigate = useRouteNavigate();
 *
 * navigate('BlogComments');
 * ```
 */
export function useRouteNavigate() {
  const router = useRouter();
  const layoutStore = useLayoutStore();

  return (name: string) => {
    const tab = layoutStore.tabList.find((item) => item.name === name);

    if (tab?.fullPath) {
      router.push(tab.fullPath);
    } else {
      router.push({ name });
    }
  };
}
