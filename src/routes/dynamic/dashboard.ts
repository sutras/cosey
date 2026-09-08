import { LayoutBase, defineRoutes } from 'cosey';

/**
 * 仪表板路由
 */
export default defineRoutes({
  path: '/dashboard',
  name: 'Dashboard',
  component: LayoutBase,
  meta: {
    title: 'dashboard.dashboard',
    icon: 'bi bi-speedometer2',
    order: -10,
    authority: (ability) => ability.can('read', 'analysis') || ability.can('read', 'workspace'),
  },
  children: [
    {
      path: 'workspace',
      name: 'Workspace',
      component: () => import('@/views/dashboard/workspace.vue'),
      meta: {
        title: 'dashboard.workspace',
        icon: 'bi bi-window-sidebar',
        closable: false,
        authority: (ability) => ability.can('read', 'workspace'),
      },
    },
    {
      path: 'analysis',
      name: 'Analysis',
      component: () => import('@/views/dashboard/analysis/index.vue'),
      meta: {
        title: 'dashboard.analytics',
        icon: 'bi bi-bar-chart-line',
        authority: (ability) => ability.can('read', 'analysis'),
      },
    },
  ],
});
