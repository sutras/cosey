<template>
  <div :class="[hashId, prefixCls]">
    <MergedLayoutSidebar v-if="layoutStore.isMobile || !layoutStore.isHorizontal">
      <MergedLayoutSnugAside
        v-if="!layoutStore.isMobile && (layoutStore.isBiserial || layoutStore.isHorizontalBiserial)"
      />
      <MergedLayoutAside
        v-if="
          layoutStore.isMobile ||
          layoutStore.isVertical ||
          layoutStore.isBiserial ||
          layoutStore.isHorizontalVertical ||
          layoutStore.isHorizontalBiserial
        "
      />
    </MergedLayoutSidebar>

    <MergedLayoutMask v-if="layoutStore.isMobile" />

    <MergedLayoutContent>
      <MergedLayoutHeader>
        <MergedLayoutTopbar>
          <template #left>
            <MergedLayoutBrand
              v-if="
                !layoutStore.isMobile &&
                (layoutStore.isHorizontal ||
                  layoutStore.isHorizontalVertical ||
                  layoutStore.isHorizontalBiserial)
              "
              is-horizontal
            />
            <MergedLayoutToggle
              v-if="layoutStore.isMobile || layoutStore.isVertical || layoutStore.isBiserial"
            />
            <MergedLayoutBreadcrumb
              v-if="!layoutStore.isMobile && (layoutStore.isVertical || layoutStore.isBiserial)"
            />
            <MergedLayoutTopSnugMenu
              v-if="
                !layoutStore.isMobile &&
                (layoutStore.isHorizontalVertical || layoutStore.isHorizontalBiserial)
              "
            />
            <MergedLayoutMenu
              v-if="!layoutStore.isMobile && layoutStore.isHorizontal"
              mode="horizontal"
              style="flex: 1"
            />
          </template>
          <template #right>
            <MergedLayoutSearch />
            <component :is="TopbarRight" />
            <MergedLayoutColorScheme />
            <MergedLayoutUserMenu />
          </template>
        </MergedLayoutTopbar>
        <MergedLayoutTabbar />
      </MergedLayoutHeader>
      <MergedLayoutMain />
    </MergedLayoutContent>
  </div>
</template>

<script setup lang="ts">
import MergedLayoutAside from '../merged/layout-aside';
import MergedLayoutBrand from '../merged/layout-brand';
import MergedLayoutBreadcrumb from '../merged/layout-breadcrumb';
import MergedLayoutContent from '../merged/layout-content';
import MergedLayoutHeader from '../merged/layout-header';
import MergedLayoutMain from '../merged/layout-main';
import MergedLayoutMask from '../merged/layout-mask';
import MergedLayoutMenu from '../merged/layout-menu';
import MergedLayoutSidebar from '../merged/layout-sidebar';
import MergedLayoutSnugAside from '../merged/layout-snug-aside';
import MergedLayoutTabbar from '../merged/layout-tabbar';
import MergedLayoutToggle from '../merged/layout-toggle';
import MergedLayoutTopSnugMenu from '../merged/layout-top-snug-menu';
import MergedLayoutTopbar from '../merged/layout-topbar';
import MergedLayoutColorScheme from '../merged/layout-color-scheme';
import MergedLayoutSearch from '../merged/layout-search';
import MergedLayoutUserMenu from '../merged/layout-user-menu';

import useStyle from './style';
import { useComponentConfig } from '../../components';

import { useLayoutStore } from '../../store';
import { useGlobalConfig } from '../../config';
import { defineTemplate } from '../../utils';

defineOptions({
  name: 'LayoutBase',
});

const { prefixCls } = useComponentConfig('layout-base');
const { hashId } = useStyle(prefixCls);

const layoutStore = useLayoutStore();
const slotsConfig = useGlobalConfig().slots;

const TopbarRight = defineTemplate(() => slotsConfig.topbarRight?.());
</script>
