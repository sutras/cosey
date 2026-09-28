<template>
  <ElTabPane v-bind="mergedProps" ref="paneRef">
    <template v-if="labelSlotVisible" #label>
      <slot name="label">
        <span :class="bem.e('label')">{{ label }}</span>
      </slot>
      <span v-if="errorCount > 0" :class="bem.e('badge')">{{ errorCount }}</span>
    </template>
    <slot></slot>
  </ElTabPane>
</template>

<script lang="ts" setup>
import { computed, inject, onBeforeUnmount, ref, useSlots } from 'vue';
import { ElTabPane } from 'element-plus';
import { auid, createBem } from '../../utils';
import {
  type FormTabName,
  type FormTabPanelEntry,
  type FormTabPanelSlots,
  type FormTabsContext,
  formTabPanelProps,
  formTabsContextSymbol,
} from './form-tabs.api';

defineOptions({
  name: 'CoFormTabPanel',
});

const props = defineProps(formTabPanelProps);

defineSlots<FormTabPanelSlots>();

const slots = useSlots();

const bem = createBem('form-tabs');

const paneRef = ref();

/**
 * 没传 `name` 时自己生成一个，而不是沿用 el-tabs 的序号：
 * 序号会随页签动态增删而变化，拿它做「切到某个页签」的目标不稳定。
 */
const autoName = auid('co-form-tab-panel-');

const panelName = computed<FormTabName>(() => props.name ?? autoName);

const mergedProps = computed(() => ({
  ...props,
  name: panelName.value,
}));

const formTabsContext = inject<FormTabsContext | null>(formTabsContextSymbol, null);

const errorCount = computed(() => formTabsContext?.getPanelState(panelName.value).errorCount ?? 0);

/**
 * 两种情况才接管 label：
 * 1. 用户传了 `label` 插槽 —— 它就该一直生效，不能等到出错才出现；
 * 2. 有错误需要显示徽标。
 * 其余情况让 el-tabs 继续用 `label` 属性渲染，未出错时的 DOM 与原生 el-tabs 完全一致。
 *
 * 徽标渲染在插槽**外面**，这样自定义标题也不会把它顶掉。
 */
const labelSlotVisible = computed(() => !!slots.label || errorCount.value > 0);

if (formTabsContext) {
  const panel: FormTabPanelEntry = {
    uid: auid('co-form-tab-panel-key-'),
    id: () => panelName.value,
    getEl: () => paneRef.value?.$el as HTMLElement | undefined,
    errorCount: 0,
  };

  // 在 setup 阶段注册，父组件据此知道有哪些页签、各自在哪个 DOM 子树里
  const cancelPanel = formTabsContext.addPanel(panel);

  onBeforeUnmount(() => {
    cancelPanel();
  });
}

defineExpose({
  /** el-tab-pane 的实例 */
  paneRef,
});
</script>
