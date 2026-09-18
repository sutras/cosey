<template>
  <div
    :class="[bem.b(), bem.is('hide', layoutStore.defaultMenus.length === 0)]"
    :style="asideStyle"
  >
    <div
      v-show="layoutStore.isMobile || !layoutStore.includeHorizontal"
      :class="bem.e('header')"
      :style="{ height: `${layoutStore.topbarHeight - 1}px` }"
    >
      <component
        :is="BrandComp"
        :hide-logo="
          !layoutStore.isMobile &&
          (layoutStore.menuType === 'biserial' || layoutStore.menuType === 'horizontal-biserial')
        "
        :hide-name="!layoutStore.isMobile && layoutStore.collapse"
      />
    </div>
    <ScrollView :class="bem.e('body')">
      <component :is="MenuComp" />
    </ScrollView>
    <div v-if="!layoutStore.isMobile" :class="bem.e('footer')">
      <el-button text bg size="small" @click="layoutStore.collapse = !layoutStore.collapse">
        <Icon size="lg">
          <component :is="layoutStore.collapse ? RtiChevronRight : RtiChevronLeft" />
        </Icon>
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { ElButton } from 'element-plus';
import LayoutBrand from '../layout-brand/layout-brand.vue';
import LayoutMenu from '../layout-menu/layout-menu.vue';
import { useLayoutStore } from '../../store';
import { useGlobalConfig } from '../../config';
import { useOptionalComponent } from '../../hooks';
import { ScrollView, Icon } from '../../components';
import { RtiChevronLeft, RtiChevronRight } from 'richtext-icons';
import { createBem } from '../../utils';

defineOptions({
  name: 'CoLayoutAside',
});

const bem = createBem('layout-aside');

const layoutStore = useLayoutStore();

const { components } = useGlobalConfig();
const BrandComp = useOptionalComponent(() => components?.brand, LayoutBrand);
const MenuComp = useOptionalComponent(() => components?.menu, LayoutMenu);

const asideStyle = computed(() => {
  return {
    width:
      (layoutStore.defaultMenus.length === 0
        ? 0
        : layoutStore.collapse
          ? layoutStore.collapsedAsideWidth
          : layoutStore.asideWidth) + 'px',
  };
});
</script>
