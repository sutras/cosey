import { defineConfig } from 'vitepress';
import path from 'node:path';
import { markdownPlugin } from './markdown';
import tailwindcss from '@tailwindcss/vite';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons';

import pkg from '../../../packages/cosey/package.json' with { type: 'json' };

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Cosey Admin',
  description: 'A VitePress Site',
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), 'docs'),
      },
    },
    plugins: [
      tailwindcss(),
      vueJsx(),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'docs/assets/icons')],
        svgoOptions: process.env.NODE_ENV === 'production',
        symbolId: 'icon-[dir]-[name]',
      }),
      groupIconVitePlugin(),
    ] as any,
    optimizeDeps: {
      exclude: ['cosey'],
    },
    ssr: {
      noExternal: true,
    },
  },
  markdown: {
    config(md) {
      markdownPlugin(md);
      md.use(groupIconMdPlugin);
    },
  },
  head: [
    ['link', { ref: 'icon', href: '/favicon.ico' }],
    [
      'script',
      {},
      `var _hmt = _hmt || [];
        (function() {
          var hm = document.createElement("script");
          hm.src = "https://hm.baidu.com/hm.js?6aaa60df631d8ed6b4e937b53f36df1a";
          var s = document.getElementsByTagName("script")[0]; 
          s.parentNode.insertBefore(hm, s);
        })();`,
    ],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://netdna.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
      },
    ],
  ],

  themeConfig: {
    siteTitle: 'Cosey Admin',
    logo: '/logo.svg',
    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2025 wuzhitao',
    },

    search: {
      provider: 'local',
    },

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '教程', link: '/guide/intro' },
      { text: '组件', link: '/components/container' },
      {
        text: pkg.version,
        items: [
          {
            text: '更新日志',
            link: 'https://github.com/sutras/cosey/blob/main/CHANGELOG.md',
          },
        ],
      },
      { text: '演示', link: 'https://cosey.wzt.zone/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '起步',
          items: [
            { text: '关于 Cosey Admin', link: '/guide/intro' },
            { text: '快速开始', link: '/guide/quick-start' },
          ],
        },
        {
          text: '基础',
          items: [
            { text: '接口请求', link: '/guide/request' },
            { text: '认证与授权', link: '/guide/auth' },
            { text: '路由与菜单', link: '/guide/route' },
            { text: '布局', link: '/guide/layout' },
            { text: '文件上传', link: '/guide/upload' },
            { text: '样式', link: '/guide/style' },
            { text: '构建部署', link: '/guide/build' },
          ],
        },
        {
          text: '深入',
          items: [
            { text: '主题', link: '/guide/theme' },
            { text: '国际化', link: '/guide/i18n' },
          ],
        },
        {
          text: '迁移',
          items: [{ text: '0.x.x 升级到 1.x.x', link: '/guide/upgrade-to-1' }],
        },
      ],
      '/components/': [
        {
          text: 'Basic 基础组件',
          items: [
            {
              text: 'Container 容器',
              link: '/components/container',
            },
            {
              text: 'Grid 栅格',
              link: '/components/grid',
            },
            { text: 'Icon 图标', link: '/components/icon' },
          ],
        },
        {
          text: '配置组件',
          items: [
            {
              text: 'ConfigProvider 全局配置',
              link: '/components/config-provider',
            },
          ],
        },
        {
          text: 'Form 表单组件',
          items: [
            { text: 'Editor 编辑器', link: '/components/editor' },
            { text: 'Form 表单', link: '/components/form' },
            { text: 'FormDialog 对话框表单', link: '/components/form-dialog' },
            { text: 'FormDrawer 抽屉表单', link: '/components/form-drawer' },
            { text: 'FormGroup 折叠表单组', link: '/components/form-group' },
            { text: 'FormList 表单列表', link: '/components/form-list' },
            { text: 'FormQuery 查询表单', link: '/components/form-query' },
            { text: 'FormSteps 分步表单', link: '/components/form-steps' },
            { text: 'FormTabs 表单页签', link: '/components/form-tabs' },
            { text: 'InputNumberRange 数字范围输入框', link: '/components/input-number-range' },
            { text: 'Upload 上传', link: '/components/upload' },
            { text: 'RemoteSelect 远程选择器', link: '/components/remote-select' },
            { text: 'WeekRangePicker 周范围选择器', link: '/components/week-range-picker' },
          ],
        },
        {
          text: 'Data 数据展示',
          items: [
            { text: 'Card 卡片', link: '/components/card' },
            { text: 'Descriptions 描述列表', link: '/components/descriptions' },
            { text: 'Highlight 代码高亮', link: '/components/highlight' },
            { text: 'HorizontalTree 水平树', link: '/components/horizontal-tree' },
            { text: 'LongText 长文本', link: '/components/long-text' },
            { text: 'MediaCard 媒体卡片', link: '/components/media-card' },
            {
              text: 'NumberFormat 数字格式化',
              link: '/components/number-format',
            },
            { text: 'ScrollView 滚动视图', link: '/components/scroll-view' },
            { text: 'Table 表格', link: '/components/table' },
            { text: 'StackDialog 层叠对话框', link: '/components/stack-dialog' },
            { text: 'Panel 面板', link: '/components/panel' },
            { text: 'Ribbon 丝带角标', link: '/components/ribbon' },
          ],
        },
        {
          text: 'Navigation 导航',
          items: [
            {
              text: 'ContextMenu 上下文菜单',
              link: '/components/context-menu',
            },
            { text: 'SnugMenu 舒适菜单', link: '/components/snug-menu' },
          ],
        },
        {
          text: 'Feedback 反馈组件',
          items: [
            { text: 'CheckUpdates 版本更新检测', link: '/components/check-updates' },
            { text: 'Copy 复制', link: '/components/copy' },
            { text: 'DndSort 拖拽排序', link: '/components/dnd-sort' },
            {
              text: 'TransitionGroup 过渡组',
              link: '/components/transition-group',
            },
          ],
        },
      ],
    },

    outline: {
      level: 'deep',
      label: '页面导航',
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/sutras/cosey' }],
  },
  rewrites: {
    'markdown/:page1': ':page1',
    'markdown/:page1/:page2': ':page1/:page2',
    'markdown/:page1/:page2/:page3': ':page1/:page2/:page3',
    'markdown/:page1/:page2/:page3/:page4': ':page1/:page2/:page3/:page4',
  },
});
