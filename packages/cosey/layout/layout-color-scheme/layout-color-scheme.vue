<template>
  <div>
    <el-button ref="button" link size="large" :class="bem.b()" @click="onClick">
      <Icon :class="[bem.e('icon'), bem.is('light', !isDark)]" size="xl">
        <component :is="isDark ? RtiMoon : RtiSun" />
      </Icon>
    </el-button>
  </div>
</template>

<script lang="tsx" setup>
import { useColorScheme } from '../../hooks';
import { Icon } from '../../components';
import { RtiMoon, RtiSun } from 'richtext-icons';
import { computed, nextTick, useTemplateRef } from 'vue';
import { type ButtonInstance, ElButton } from 'element-plus';
import { createBem } from '../../utils';

defineOptions({
  name: 'CoLayoutColorScheme',
});

const bem = createBem('layout-color-scheme');

const { appliedColorScheme, colorScheme } = useColorScheme();

const isDark = computed(() => appliedColorScheme.value === 'dark');

const buttonRef = useTemplateRef<ButtonInstance>('button');

const onClick = async () => {
  startViewTransition(buttonRef.value?.$el);
};

const updateCallback = async () => {
  colorScheme.value = isDark.value ? 'light' : 'dark';
  await nextTick();
};

const startViewTransition = (el: HTMLElement) => {
  const isAppearanceTransition =
    !!document.startViewTransition &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isAppearanceTransition) {
    updateCallback();
    return;
  }

  const rect = el.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  const ratioX = (100 * x) / innerWidth;
  const ratioY = (100 * y) / innerHeight;
  const referR = Math.hypot(innerWidth, innerHeight) / Math.SQRT2;
  const ratioR = (100 * endRadius) / referR;

  const viewTransition = document.startViewTransition(updateCallback);

  viewTransition.ready.then(async () => {
    const clipPath = [
      `circle(0% at ${ratioX}% ${ratioY}%)`,
      `circle(${ratioR}% at ${ratioX}% ${ratioY}%)`,
    ];
    document.documentElement.animate(
      {
        clipPath: isDark.value ? [...clipPath].reverse() : clipPath,
      },
      {
        duration: 400,
        easing: 'ease-in',
        fill: 'both',
        pseudoElement: isDark.value ? '::view-transition-old(root)' : '::view-transition-new(root)',
      },
    );
  });
};
</script>
