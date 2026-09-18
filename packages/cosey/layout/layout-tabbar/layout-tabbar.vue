<template>
  <div v-if="layoutStore.tabbarVisible" :class="bem.b()" :style="tabbarStyle">
    <div :class="bem.e('tabs-wrapper')">
      <el-tabs
        v-model="layoutStore.activeTab"
        type="card"
        :style="{ '--el-border-color-light': getCssVar('border-color') }"
        @tab-remove="onTabRemove"
      >
        <el-tab-pane
          v-for="(item, index) in layoutStore.tabList"
          :key="item.name"
          :name="item.name"
          :closable="item.meta.closable"
        >
          <template #label>
            <Icon v-if="item.meta.icon" :name="item.meta.icon" :class="bem.e('icon')" />
            {{ _t(item.meta.title ?? '') }}

            <ContextMenu>
              <template #reference>
                <div :class="bem.e('context-menu-reference')"></div>
              </template>
              <ContextMenuItem
                :title="t('co.common.reload')"
                :icon="RtiRotate360"
                :disabled="item.name !== layoutStore.activeTab"
                @click="layoutStore.reload()"
              />
              <ContextMenuItem
                :title="t('co.common.close')"
                :icon="RtiClose"
                :disabled="!item.meta.closable"
                divided
                @click="closeTab(item.name)"
              />
              <ContextMenuItem
                :title="t('co.tabbar.closeLeftTabs')"
                :disabled="index === 0 || index === 1"
                @click="closeLeftTabs(item.name, index)"
              />
              <ContextMenuItem
                :title="t('co.tabbar.closeRightTabs')"
                :disabled="index === layoutStore.tabList.length - 1"
                @click="closeRightTabs(item.name, index)"
              />
              <ContextMenuItem
                :title="t('co.tabbar.closeOtherTabs')"
                :disabled="
                  layoutStore.tabList.length === 1 ||
                  (layoutStore.tabList.length === 2 && index === 1)
                "
                @click="closeOtherTabs(item.name)"
              />
            </ContextMenu>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div :class="bem.e('toolbar')">
      <el-divider direction="vertical" />
      <Reload />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGlobalConfig } from '../../config';
import { useLayoutStore } from '../../store';
import { ContextMenu, ContextMenuItem, Icon } from '../../components';
import { RtiClose, RtiRotate360 } from 'richtext-icons';
import Reload from './reload.vue';

import { useLocale } from '../../hooks';
import { useI18n } from 'vue-i18n';
import { createBem, getCssVar } from '../../utils';

defineOptions({
  name: 'CoLayoutTabbar',
});

const { t } = useLocale();

const { t: _t } = useI18n();

const bem = createBem('layout-tabbar');

const router = useRouter();
const route = useRoute();

const routerConfig = useGlobalConfig().router;

const layoutStore = useLayoutStore();

layoutStore.activeTab = route.name as string;

const homeRoute = router.getRoutes().find((route) => route.path === routerConfig.homePath);

if (homeRoute) {
  layoutStore.tabList = [{ name: homeRoute.name as string, meta: homeRoute.meta }];
}

if (route.path !== routerConfig.homePath) {
  layoutStore.tabList.push({
    name: route.name as string,
    meta: route.meta,
  });
}

router.afterEach((to) => {
  if (!layoutStore.tabList.find((item) => item.name === to.name)) {
    layoutStore.tabList.push({
      name: to.name as string,
      meta: to.meta,
    });
  }
  layoutStore.activeTab = to.name as string;
});

const closeTab = (name: string | number) => {
  const index = layoutStore.tabList.findIndex((item) => item.name === name);
  layoutStore.tabList.splice(index, 1);
  if (layoutStore.activeTab === name) {
    const item = layoutStore.tabList[Math.min(index, layoutStore.tabList.length - 1)];
    if (item) {
      layoutStore.activeTab = item.name;
    }
  }
};

const closeLeftTabs = (name: string, index: number) => {
  layoutStore.tabList = layoutStore.tabList.filter((item, i) => i >= index || !item.meta.closable);
  if (!layoutStore.tabList.find((item) => item.name === layoutStore.activeTab)) {
    layoutStore.activeTab = name;
  }
};

const closeRightTabs = (name: string, index: number) => {
  layoutStore.tabList = layoutStore.tabList.filter((item, i) => i <= index || !item.meta.closable);
  if (!layoutStore.tabList.find((item) => item.name === layoutStore.activeTab)) {
    layoutStore.activeTab = name;
  }
};

const closeOtherTabs = (name: string) => {
  layoutStore.tabList = layoutStore.tabList.filter(
    (item) => item.name === name || !item.meta.closable,
  );
  layoutStore.activeTab = name;
};

watch(
  () => layoutStore.activeTab,
  () => {
    router.push({
      name: layoutStore.activeTab as string,
    });
  },
);

const onTabRemove = (name: string | number) => {
  closeTab(name);
};

const tabbarStyle = computed(() => {
  const marginInlineStart = layoutStore.includeHorizontal ? layoutStore.sidebarWidth + 'px' : 0;

  return {
    marginInlineStart,
  };
});
</script>
