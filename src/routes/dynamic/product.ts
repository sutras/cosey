import { defineRoutes, LayoutBase } from 'cosey';

export default defineRoutes({
  path: '/product',
  name: 'Product',
  component: LayoutBase,
  meta: {
    title: 'product.productManagement',
    icon: 'bi bi-box-seam',
    authority: (ability) =>
      ability.can('read', 'product') || ability.can('read', 'product_category'),
  },
  children: [
    {
      path: 'list',
      name: 'Products',
      component: () => import('@/views/products/index.vue'),
      meta: {
        title: 'product.list',
        icon: 'bi bi-box',
        authority: (ability) => ability.can('read', 'product'),
      },
    },
    {
      path: 'categories',
      name: 'ProductCategories',
      component: () => import('@/views/product-categories/index.vue'),
      meta: {
        title: 'product.categories',
        icon: 'bi bi-tags',
        authority: (ability) => ability.can('read', 'product_category'),
      },
    },
  ],
});
