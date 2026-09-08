<template>
  <div>
    <el-button link size="large" @click="open = !open">
      <Icon name="bi bi-gear" size="xl" />
    </el-button>
  </div>

  <el-drawer
    v-model="open"
    size="360px"
    :title="t('setting.settings')"
    append-to-body
    :header-class="bem.e('header')"
    :class="bem.b()"
  >
    <Title>{{ t('setting.menuType') }}</Title>
    <el-radio-group v-model="layoutStore.menuType">
      <el-radio
        v-for="item in menuTypes"
        :key="item"
        :value="item"
        :style="{
          margin: 0,
          marginBlockEnd: getCssVar('margin-xs'),
          width: '50%',
        }"
      >
        {{ item }}
      </el-radio>
    </el-radio-group>

    <Title>{{ t('setting.verticalMenuExpandCollapse') }}</Title>
    <el-switch v-model="layoutStore.collapse" />

    <Title>{{ t('setting.showSidebar') }}</Title>
    <el-switch v-model="layoutStore.sidebarVisible" />

    <Title>{{ t('setting.showTabs') }}</Title>
    <el-switch v-model="layoutStore.tabbarVisible" />

    <template v-if="httpMessageManager">
      <Title>Mock</Title>
      <el-button type="primary" @click="resetLocalDB">
        {{ t('setting.resetLocalDatabase') }}
      </el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="tsx">
import { defineComponent, inject, ref } from 'vue';
import { ElButton } from 'element-plus';
import { useLayoutStore } from 'cosey/store';
import { Icon } from 'cosey/components';
import { getCssVar } from 'cosey/utils';
import { createBem } from 'cosey/utils';
import { HttpMessageManager, resetDB } from '@cosey/mock';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
defineOptions({
  name: 'LayoutSetting',
});

const bem = createBem('layout-setting');

const layoutStore = useLayoutStore();

const menuTypes = ref([
  'vertical',
  'biserial',
  'horizontal',
  'horizontal-vertical',
  'horizontal-biserial',
]);

const open = ref(false);

const httpMessageManager = inject<HttpMessageManager | null>('mockContext', null);

const resetLocalDB = async () => {
  await resetDB();
  window.location.reload();
};

const Title = defineComponent({
  setup:
    (_, { slots }) =>
    () => (
      <div
        style={{
          marginBlockStart: getCssVar('margin-sm'),
          marginBlockEnd: getCssVar('margin-xs'),
          fontSize: getCssVar('font-size-base'),
          fontWeight: getCssVar('font-weight-strong'),
        }}
      >
        {slots.default?.()}
      </div>
    ),
});
</script>
