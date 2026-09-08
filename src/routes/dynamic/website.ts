import { defineRoutes, LayoutBase, LayoutEmpty } from 'cosey';

export default defineRoutes({
  path: '/website',
  component: LayoutBase,
  meta: {
    title: 'website.externalPages',
    icon: 'bi bi-window',
  },
  children: [
    {
      path: 'link',
      meta: {
        title: 'website.externalLinks',
        icon: 'bi bi-box-arrow-up-right',
        type: 'group',
      },
      children: [
        {
          path: 'https://cn.vuejs.org/',
          component: LayoutEmpty,
          meta: {
            title: 'Vue',
            icon: 'svg:vue',
          },
        },
        {
          path: 'https://cn.vitejs.dev/',
          component: LayoutEmpty,
          meta: {
            title: 'Vite',
            icon: 'svg:vite',
          },
        },
      ],
    },
    {
      path: 'iframe',
      meta: {
        title: 'website.embedded',
        icon: 'bi bi-app-indicator',
      },
      children: [
        {
          path: 'element',
          component: LayoutEmpty,
          meta: {
            title: 'element',
            icon: 'svg:element',
            iframeSrc: 'https://element-plus.org/zh-CN/',
          },
        },
        {
          path: 'pinia',
          component: LayoutEmpty,
          meta: {
            title: 'pinia',
            icon: 'svg:pinia',
            iframeSrc: 'https://pinia.vuejs.org/',
          },
        },
      ],
    },
  ],
});
