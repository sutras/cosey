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

const onClick = () => {
  startViewTransition(buttonRef.value?.$el);
};

const updateCallback = async () => {
  colorScheme.value = isDark.value ? 'light' : 'dark';
  await nextTick();
};

const startViewTransition = (el?: HTMLElement) => {
  const isAppearanceTransition =
    !!document.startViewTransition &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isAppearanceTransition) {
    updateCallback();
    return;
  }

  const rect = el?.getBoundingClientRect();
  const x = rect ? rect.left + rect.width / 2 : innerWidth / 2;
  const y = rect ? rect.top + rect.height / 2 : innerHeight / 2;

  const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  const ratioX = (100 * x) / innerWidth;
  const ratioY = (100 * y) / innerHeight;
  const referR = Math.hypot(innerWidth, innerHeight) / Math.SQRT2;
  const ratioR = (100 * endRadius) / referR;

  const toDark = !isDark.value;
  const origin = `${ratioX}% ${ratioY}%`;

  // 切亮：新（亮色）快照从点击点扩张；切暗：旧（亮色）快照收缩回点击点
  const clipPath = toDark
    ? [`circle(${ratioR}% at ${origin})`, `circle(0% at ${origin})`]
    : [`circle(0% at ${origin})`, `circle(${ratioR}% at ${origin})`];

  const viewTransition = document.startViewTransition(updateCallback);

  let animation: Animation | undefined;

  viewTransition.ready.then(() => {
    animation = document.documentElement.animate(
      { clipPath },
      {
        duration: 400,
        easing: 'ease-in',
        fill: 'both',
        pseudoElement: toDark ? '::view-transition-old(root)' : '::view-transition-new(root)',
      },
    );
  });

  viewTransition.finished.catch(() => {}).finally(() => animation?.cancel());
};
</script>
