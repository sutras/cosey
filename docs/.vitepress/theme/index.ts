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
