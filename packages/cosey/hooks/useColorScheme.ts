/**
 * 颜色方案（亮色、暗色）
 *
 * 动态修改，持久化缓存
 */

import {
  computed,
  ComputedRef,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  type Component,
  type Ref,
  ref,
  watch,
} from 'vue';
import { RtiCircleHalfFull, RtiMoon, RtiSun } from 'richtext-icons';
import { isClient } from '../utils';
import { persist } from '../persist';

const colorSchemeContextSymbol = Symbol('colorScheme');

const colorSchemeKey = 'Cosey:colorScheme';

type ColorScheme = 'dark' | 'light' | 'auto';
type AppliedColorScheme = 'dark' | 'light';

export interface ColorSchemeOption {
  label: string;
  /** 图标组件，直接 `<component :is="option.icon" />` 渲染 */
  icon: Component;
  value: ColorScheme;
}

interface ColorSchemeContext {
  colorSchemeOption: Ref<ColorSchemeOption>;
  colorScheme: Ref<ColorScheme>;
  appliedColorScheme: ComputedRef<AppliedColorScheme>;
}

export const colorSchemeOptions: ColorSchemeOption[] = [
  { label: 'co.colorScheme.auto', icon: RtiCircleHalfFull, value: 'auto' },
  { label: 'co.colorScheme.light', icon: RtiSun, value: 'light' },
  { label: 'co.colorScheme.dark', icon: RtiMoon, value: 'dark' },
];

export function useColorSchemeProvide() {
  const defaultColorScheme = (persist.get(colorSchemeKey) || 'auto') as ColorScheme;

  const colorScheme = ref<ColorScheme>(defaultColorScheme);
  const appliedColorScheme = ref<AppliedColorScheme>('light');

  const colorSchemeOption = computed(() => {
    return colorSchemeOptions.find((option) => option.value === colorScheme.value)!;
  });

  const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

  const handleChange = (event: MediaQueryListEvent) => {
    if (colorScheme.value === 'auto') {
      appliedColorScheme.value = event.matches ? 'dark' : 'light';
    }
  };

  onMounted(() => {
    mediaQueryList.addEventListener('change', handleChange);
  });

  onBeforeUnmount(() => {
    mediaQueryList.removeEventListener('change', handleChange);
  });

  watch(
    colorScheme,
    () => {
      if (colorScheme.value === 'auto') {
        appliedColorScheme.value = mediaQueryList.matches ? 'dark' : 'light';
      } else {
        appliedColorScheme.value = colorScheme.value;
      }
      persist.set(colorSchemeKey, colorScheme.value);
      localStorage.setItem(colorSchemeKey, colorScheme.value);
    },
    {
      immediate: true,
    },
  );

  watch(
    appliedColorScheme,
    () => {
      if (isClient()) {
        if (appliedColorScheme.value === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    {
      immediate: true,
    },
  );

  const context: ColorSchemeContext = {
    colorSchemeOption,
    colorScheme,
    appliedColorScheme: computed(() => appliedColorScheme.value),
  };

  provide<ColorSchemeContext>(colorSchemeContextSymbol, context);

  return context;
}

export function useColorScheme() {
  return inject<ColorSchemeContext>(colorSchemeContextSymbol) as ColorSchemeContext;
}
