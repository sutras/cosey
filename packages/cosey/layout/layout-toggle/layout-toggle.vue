<template>
  <el-button link @click.stop="toggle">
    <Icon size="xl">
      <component :is="layoutStore.sidebarVisible ? RtiSidePanelClose : RtiSidePanelOpen" />
    </Icon>
  </el-button>
</template>

<script setup lang="ts">
import { ElButton } from 'element-plus';
import { useLayoutStore } from '../../store';
import { Icon } from '../../components';
import { RtiSidePanelClose, RtiSidePanelOpen } from 'richtext-icons';

defineOptions({
  name: 'CoLayoutToggle',
});

const layoutStore = useLayoutStore();

const toggle = () => {
  layoutStore.sidebarVisible = !layoutStore.sidebarVisible;
};
</script>
