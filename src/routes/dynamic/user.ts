import { defineRoutes, LayoutBase } from 'cosey';

export default defineRoutes({
  path: '/',
  component: LayoutBase,
  meta: {
    flatChildrenInMenu: true,
  },
  children: [
    {
      path: 'users',
      name: 'Users',
      component: () => import('@/views/users/index.vue'),
      meta: {
        title: 'user.userManagement',
        icon: 'bi bi-person',
        order: -1,
        authority: (ability) => ability.can('read', 'user'),
      },
    },
    {
      path: 'users/:id',
      name: 'UserDetail',
      component: () => import('@/views/users/detail.vue'),
      meta: {
        title: 'user.detail',
        hideInMenu: true,
        authority: (ability) => ability.can('read', 'user'),
      },
    },
  ],
});
