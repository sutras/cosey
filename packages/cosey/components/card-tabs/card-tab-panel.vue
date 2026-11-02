<template>
  <div
    v-if="mounted"
    v-show="visible"
    :id="panelId"
    :role="panelId ? 'tabpanel' : undefined"
    :aria-labelledby="panelId ? tabId : undefined"
    :class="bem.e('panel')"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, ref, watch } from 'vue';
import { createBem } from '../../utils';
import {
  type CardTabPanelSlots,
  type CardTabsContext,
  cardTabPanelProps,
  cardTabsContextSymbol,
  isSameTabName,
} from './card-tabs.api';

defineOptions({
  name: 'CoCardTabPanel',
});

const props = defineProps(cardTabPanelProps);

defineSlots<CardTabPanelSlots>();

const bem = createBem('card-tabs');

const cardTabsContext = inject<CardTabsContext | null>(cardTabsContextSymbol, null);

/** 不在 `co-card-tabs` 里时按普通内容渲染，别把内容藏没了 */
const visible = computed(() => {
  if (!cardTabsContext) {
    return true;
  }

  return isSameTabName(cardTabsContext.active(), props.tabName);
});

/** `lazy` 只在第一次激活后才挂载，之后靠 `v-show` 保住状态 */
const mounted = ref(!props.lazy || visible.value);

watch(visible, (value) => {
  if (value) {
    mounted.value = true;
  }
});

const panelId = computed(() =>
  cardTabsContext ? `${cardTabsContext.uid}-panel-${props.tabIndex}` : '',
);

const tabId = computed(() =>
  cardTabsContext ? `${cardTabsContext.uid}-tab-${props.tabIndex}` : '',
);
</script>
