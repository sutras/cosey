import dayjsZhCn from 'dayjs/locale/zh-cn';
import dayEn from 'dayjs/locale/en';
import dayAr from 'dayjs/locale/ar';
import dayPt from 'dayjs/locale/pt';
import dayPtBr from 'dayjs/locale/pt-br';

import coseyZhCn from 'cosey/locale/lang/zh-cn';
import coseyEn from 'cosey/locale/lang/en';
import coseyAr from 'cosey/locale/lang/ar';
import coseyPt from 'cosey/locale/lang/pt';
import coseyPtBr from 'cosey/locale/lang/pt-br';

import appZhCn from './lang/zh-cn';
import appEn from './lang/en';
import appAr from './lang/ar';
import appPt from './lang/pt';
import appPtBr from './lang/pt-br';
import { type I18nConfig } from 'cosey/config/i18n';

export const i18nConfig: I18nConfig = {
  messages: [
    {
      value: 'zh-cn',
      label: '简体中文',
      dayjs: dayjsZhCn,
      cosey: coseyZhCn,
      app: appZhCn,
    },
    {
      value: 'en',
      label: 'English',
      dayjs: dayEn,
      cosey: coseyEn,
      app: appEn,
    },
    {
      value: 'ar',
      label: 'العربية',
      dayjs: dayAr,
      cosey: coseyAr,
      app: appAr,
    },
    {
      value: 'pt-br',
      label: 'Português (Brasil)',
      dayjs: dayPtBr,
      cosey: coseyPtBr,
      app: appPtBr,
    },
    {
      value: 'pt',
      label: 'Português',
      dayjs: dayPt,
      cosey: coseyPt,
      app: appPt,
    },
  ],
};
