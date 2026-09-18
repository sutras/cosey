<template>
  <el-button link size="small" :class="bem.e('reload')" @click="layoutStore.reload()">
    <Icon size="xl" :class="[bem.e('reload-icon'), bem.is('spinning', spinning)]">
      <RtiRotate360 />
    </Icon>
  </el-button>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElButton } from 'element-plus';
import { Icon } from '../../components';
import { useLayoutStore } from '../../store';
import { useTimeoutFn } from '@vueuse/core';
import { createBem } from '../../utils';
import { RtiRotate360 } from 'richtext-icons';

defineOptions({
  name: 'CoLayoutReload',
});

const bem = createBem('layout-tabbar');

const layoutStore = useLayoutStore();

const spinning = ref(layoutStore.refreshing);

const timeout = useTimeoutFn(() => {
  spinning.value = false;
}, 600);

watch(
  () => layoutStore.refreshing,
  () => {
    if (layoutStore.refreshing) {
      spinning.value = true;
      timeout.start();
    }
  },
);
</script>
