import { defineRoutes, MergedLayoutBase } from 'cosey';

export default defineRoutes({
  path: '/system',
  name: 'System',
  component: MergedLayoutBase,
  meta: {
    title: 'system.system',
    icon: 'carbon:settings',
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
        icon: 'carbon:enumeration-definition',
        authority: (ability) => ability.can('read', 'system_enum'),
      },
    },
    {
      path: 'configs',
      name: 'SystemConfigs',
      component: () => import('@/views/system/configs/index.vue'),
      meta: {
        title: 'system.configuration',
        icon: 'carbon:cloud-satellite-config',
        authority: (ability) => ability.can('read', 'system_config'),
      },
    },
  ],
});
