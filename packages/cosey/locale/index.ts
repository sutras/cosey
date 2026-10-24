import { type App, inject, InjectionKey, Ref, shallowRef, toValue, watch } from 'vue';
import { createI18n, type I18n } from 'vue-i18n';
import { defaultsDeep } from 'lodash-es';
import dayjs from 'dayjs';
import { defaultI18nConfig, RequiredI18nConfig, type I18nConfig } from '../config/i18n';
import { persist } from '../persist';
import { ref } from 'vue';

export type TranslatePair = {
  [key: string]: string | string[] | TranslatePair;
};

export type Language = {
  name: string;
  el: TranslatePair;
  co: TranslatePair;
};

const langKey = 'Cosey:lang';

const rtlLangs = ['ar'];

function getMessages(config: RequiredI18nConfig, type: 'dayjs' | 'cosey' | 'app') {
  const langs: Record<string, any> = {};
  config.messages.forEach((item) => {
    langs[item.value] = item[type];
  });
  return langs;
}

const coseyLocaleKey = Symbol('coseyLocale') as InjectionKey<Ref<Language>>;
const localeMessagesKey = Symbol('localeMessages') as InjectionKey<RequiredI18nConfig['messages']>;

export let i18n: I18n<Record<string, any>, {}, {}, any, false>;

export function launchLocale(app: App, config: I18nConfig = {}) {
  const mergedConfig: RequiredI18nConfig = defaultsDeep(config, defaultI18nConfig);

  const appMessages = getMessages(mergedConfig, 'app');
  const coesyMessages = getMessages(mergedConfig, 'cosey');
  const dayjsMessages = getMessages(mergedConfig, 'dayjs');

  /**
   * 应用词条与框架词条合成同一份：`vue-i18n` 和 `useLocale` 读的是同一个对象，
   * 应用侧因此也能翻译、覆盖 `co.*`。
   */
  const messages: Record<string, any> = {};

  mergedConfig.messages.forEach((item) => {
    messages[item.value] = defaultsDeep({}, appMessages[item.value], coesyMessages[item.value]);
  });

  const locale = persist.get(langKey) || mergedConfig.locale;
  const coseyLocale = shallowRef<Language>({} as Language);

  i18n = createI18n({
    legacy: false,
    locale: locale,
    fallbackLocale: locale,
    messages,
    silentTranslationWarn: true,
    silentFallbackWarn: true,
    missingWarn: false,
    fallbackWarn: false,
  });

  watch(
    () => toValue(i18n.global.locale),
    (locale) => {
      coseyLocale.value = messages[locale] ?? ({} as Language);
      dayjs.locale(dayjsMessages[locale]);
      persist.set(langKey, locale);

      document.documentElement.setAttribute('dir', rtlLangs.includes(locale) ? 'rtl' : 'ltr');
    },
    {
      immediate: true,
    },
  );

  app.use(i18n);

  app.provide(coseyLocaleKey, coseyLocale);

  app.provide(localeMessagesKey, mergedConfig.messages);
}

export function useCoseyLocale() {
  return inject(coseyLocaleKey, ref({} as Language));
}

export function useLocaleMessages() {
  return inject(localeMessagesKey, []);
}

/**
 * 用 vue-i18n 的语言包翻译（应用词条与框架词条已合成同一份）。
 *
 * 未初始化 i18n 或 key 不存在时返回 `undefined`，由调用方决定回退策略。
 */
export function translateMessage(key: string): string | undefined {
  // vue-i18n 的 global 类型在深递归下会触发 TS2589，这里只取用到的方法
  const global = i18n?.global as unknown as
    | { te: (key: string) => boolean; t: (key: string) => string }
    | undefined;

  if (!global || !global.te(key)) {
    return undefined;
  }

  return global.t(key);
}
