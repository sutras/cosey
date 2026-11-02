<template>
  <ConfigProvider :theme="theme">
    <template #default="{ locale }">
      <ElConfigProvider :locale="locale">
        <component :is="ColorSchemeSync">
          <slot />
        </component>
      </ElConfigProvider>
    </template>
  </ConfigProvider>
</template>

<script lang="ts" setup>
import { defineComponent, watch } from 'vue';
import { useData } from 'vitepress';
import { ElConfigProvider } from 'element-plus';
import { ConfigProvider } from 'cosey/components';
import { useColorScheme } from 'cosey/hooks';

const theme = {
  token: {
    colorPrimary: '#1677ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
  },
};

/**
 * 把 VitePress 的明暗状态同步给 cosey，否则每个示例自己的 provider 会按系统偏好
 * 重新决定 html.dark，把用户在站点上切的主题顶掉。必须是 ConfigProvider 的子组件，
 * 不然 inject 拿不到 colorScheme。
 */
const ColorSchemeSync = defineComponent({
  setup(_, { slots }) {
    const { isDark } = useData();
    const { colorScheme } = useColorScheme();

    watch(
      isDark,
      (dark) => {
        colorScheme.value = dark ? 'dark' : 'light';
      },
      { immediate: true },
    );

    return () => slots.default?.();
  },
});
</script>
