import { defineRoutes, LayoutBase } from 'cosey';

export default defineRoutes({
  path: '/rbac',
  name: 'Rbac',
  component: LayoutBase,
  meta: {
    title: 'rbac.accessControl',
    icon: 'bi bi-shield-lock',
    order: 100,
    authority: (ability) =>
      ability.can('read', 'rbac_user') ||
      ability.can('read', 'rbac_role') ||
      ability.can('read', 'rbac_permission'),
  },
  children: [
    {
      path: 'admins',
      name: 'RbacAdmins',
      component: () => import('@/views/rbac/admins/index.vue'),
      meta: {
        title: 'rbac.accounts',
        icon: 'bi bi-person-gear',
        authority: (ability) => ability.can('read', 'rbac_user'),
      },
    },
    {
      path: 'roles',
      name: 'RbacRoles',
      component: () => import('@/views/rbac/roles/index.vue'),
      meta: {
        title: 'rbac.roles',
        icon: 'bi bi-person-badge',
        authority: (ability) => ability.can('read', 'rbac_role'),
      },
    },
    {
      path: 'permissions',
      name: 'RbacPermissions',
      component: () => import('@/views/rbac/permissions/index.vue'),
      meta: {
        title: 'rbac.permissions',
        icon: 'bi bi-check2-square',
        authority: (ability) => ability.can('read', 'rbac_permission'),
      },
    },
  ],
});
