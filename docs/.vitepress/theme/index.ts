import type { Theme } from 'vitepress';

import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import 'cosey/style/index.scss';
import './style.css';

import dayjs from 'dayjs';
import dayjsZhCn from 'dayjs/locale/zh-cn';

dayjs.locale(dayjsZhCn);

import { App, Component } from 'vue';
import Layout from '@/components/layout/layout.vue';

import 'virtual:svg-icons-register';
import 'bootstrap-icons/font/bootstrap-icons.css';

// import 'virtual:ssr-style.css';

import { launch } from 'cosey';
import en from 'cosey/locale/lang/en';

import { createMock } from '@cosey/mock';

import { icons as epIcons } from '@iconify-json/ep';
import { addIconifyIcon } from 'cosey/components';

import 'virtual:group-icons.css';
import commonApi from '@/api/common';
import { createMemoryHistory } from 'vue-router';

addIconifyIcon('ep', epIcons);

function getComponentName(key: string) {
  return key.split('/').pop()!.split('.')[0];
}

function registerVPGlobalComponents(app: App) {
  const vpComponents = import.meta.glob('../../components/**/*.vue', {
    eager: true,
  }) as Record<
    string,
    {
      default: Component;
    }
  >;
  Object.keys(vpComponents).forEach((key) => {
    const component = vpComponents[key] as Record<string, any>;
    app.component(`component-${getComponentName(key)}`, component.default);
  });

  const examples = import.meta.glob(`../../examples/**/*.vue`, {
    eager: true,
  });
  Object.keys(examples).forEach((key) => {
    const example = examples[key] as Record<string, any>;
    app.component(
      `${key.replaceAll('../', '').replaceAll('/', '-').replace('.vue', '')}`,
      example.default,
    );
  });
}

export default {
  async enhanceApp({ app }) {
    registerVPGlobalComponents(app);

    launch(app, {
      router: {
        listening: false,
        history: createMemoryHistory(),
      },
      http: {
        baseURL: '/mock/api',
      },
      api: {
        login: () => Promise.resolve(''),
        upload: commonApi.singleUpload,
      },
      // 应用自己的词条，供示例演示 labelKey 解析业务 key
      i18n: {
        messages: [
          {
            value: 'zh-cn',
            app: {
              dictDemo: {
                draft: '草稿（应用词条）',
                published: '已发布（应用词条）',
              },
            },
          },
          {
            value: 'en',
            // 英文语言包，示例里可以切过去看 labelKey 是否跟着变
            cosey: en,
            app: {
              dictDemo: {
                draft: 'Draft (app key)',
                published: 'Published (app key)',
              },
            },
          },
        ],
      },
      dict: {
        user_status: [
          { value: 1, label: '启用', color: 'success' },
          { value: 0, label: '禁用', color: 'info' },
          { value: 2, label: '待审核', color: 'warning' },
        ],
        // labelKey 走 i18n，随语言切换
        yes_no: [
          { value: 1, labelKey: 'co.common.yes', color: 'success' },
          { value: 0, labelKey: 'co.common.no', color: 'info' },
        ],
        // 业务自己的词条 key（在 i18n.messages[].app 里）
        post_status: [
          { value: 'draft', labelKey: 'dictDemo.draft', color: 'info' },
          { value: 'published', labelKey: 'dictDemo.published', color: 'success' },
        ],
      },
    });

    if (!import.meta.env.SSR) {
      const mock = createMock({
        skipAuth: true,
      });
      mock.intercept();
    }
  },
  Layout: Layout,
} satisfies Theme;
