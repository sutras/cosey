<template>
  <el-scrollbar wrap-style="display: flex; align-items: center">
    <SnugMenu v-model="layoutStore.topActive" mode="horizontal">
      <SnugMenuItem
        v-for="(item, i) in layoutStore.topMenus"
        :key="i"
        :name="item.name"
        :index="item.name"
        :icon="item.icon"
        :title="item.title"
        @click="onClick(item)"
      />
    </SnugMenu>
  </el-scrollbar>
</template>

<script lang="ts" setup>
import { type MenuItem } from '../../router';
import { useLayoutStore } from '../../store';
import { SnugMenu, SnugMenuItem } from '../../components';
import { ElScrollbar } from 'element-plus';
import { useRouteNavigate } from '../use-route-navigate';

defineOptions({
  name: 'CoLayoutTopSnugMenu',
});

const layoutStore = useLayoutStore();

const navigate = useRouteNavigate();

const onClick = (item: MenuItem) => {
  if (item._externalLink) {
    window.open(item.path, '_blank');
  } else {
    layoutStore.topActive = item.name;

    if (!item.children || item.children.length === 0) {
      navigate(item.name);
    }
  }
};
</script>
