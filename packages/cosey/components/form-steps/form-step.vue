<template>
  <div v-show="isActive" ref="panelRef" :class="bem.e('panel')">
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, onBeforeUnmount, ref } from 'vue';
import { auid, createBem } from '../../utils';
import {
  type FormStepsContext,
  type FormStepSlots,
  formStepProps,
  formStepsContextSymbol,
} from './form-steps.api';

defineOptions({
  name: 'CoFormStep',
});

/**
 * 步骤自己的 props 直接是 `el-step` 的那几个（title / description / icon / status），
 * 由外层 `co-form-steps` 渲染标题栏 —— `el-steps` 只负责标题，内容得自己安排。
 */
const props = defineProps(formStepProps);

/** 用 `defineSlots` 的返回值（而不是 `useSlots()`）才能拿到带上插槽名与参数的类型 */
const slots = defineSlots<FormStepSlots>();

const bem = createBem('form-steps');

const panelRef = ref<HTMLElement>();

const uid = auid('co-form-step-');

const formStepsContext = inject<FormStepsContext | null>(formStepsContextSymbol, null);

/**
 * 没套 `co-form-steps` 单独用时（写漏了外层容器）就一直显示，
 * 免得内容莫名其妙地整块消失。
 */
const isActive = computed(() => formStepsContext?.isActive(uid) ?? true);

if (formStepsContext) {
  // 在 setup 阶段注册：父组件据此渲染标题栏，并知道每个步骤的内容在哪个 DOM 子树里
  const cancelStep = formStepsContext.addStep({
    uid,
    id: () => uid,
    getEl: () => panelRef.value,
    errorCount: 0,
    props,
    slots,
  });

  onBeforeUnmount(() => {
    cancelStep();
  });
}
</script>
