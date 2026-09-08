import { defineRoutes, LayoutBase } from 'cosey';

export default defineRoutes({
  path: '/system',
  name: 'System',
  component: LayoutBase,
  meta: {
    title: 'system.system',
    icon: 'bi bi-gear',
    order: 90,
    authority: (ability) =>
      ability.can('read', 'system_enum') || ability.can('read', 'system_config'),
  },
  children: [
    {
      path: 'enums',
      name: 'SystemEnums',
      component: () => import('@/views/system/enums/index.vue'),
      meta: {
        title: 'system.enums',
        icon: 'bi bi-list-nested',
        authority: (ability) => ability.can('read', 'system_enum'),
      },
    },
    {
      path: 'configs',
      name: 'SystemConfigs',
      component: () => import('@/views/system/configs/index.vue'),
      meta: {
        title: 'system.configuration',
        icon: 'bi bi-gear-wide-connected',
        authority: (ability) => ability.can('read', 'system_config'),
      },
    },
  ],
});
