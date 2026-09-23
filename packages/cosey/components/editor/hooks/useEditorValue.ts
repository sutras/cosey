import { computed, watch } from 'vue';
import { CHANGE_EVENT, useFormItem } from 'element-plus';

import { debugWarn } from '../../../utils';
import type { EditorFacade } from '../pm/editor';

interface EditorValueProps {
  modelValue?: string | null;
  validateEvent?: boolean;
}

/** 与 `editorEmits` 同形：组件实例的 `emit` 是重载签名，不能写成联合参数的单签名函数 */
interface EditorValueEmit {
  (event: 'update:modelValue', value: string): void;
  (event: 'change', value: string): void;
}

/**
 * `v-model` 的同步协议：外部值灌进文档，文档变更回抛给外部。
 *
 * `currentValue` 记「上一次同步过的值」，两个方向都靠它去重：
 * 外部传进来的值若等于当前值就不重建文档（否则每次输入都会把光标顶到末尾），
 * 内部变更若等于当前值也不 emit（否则会形成外部 → 内部 → 外部的回环）。
 *
 * 初始化要走 `syncFromProps` 而不是靠 `watch` 的 `immediate` —— 灌值是 ProseMirror 事务，
 * 必须等 `facade.view` 就绪，所以由调用方在 view 创建后显式触发一次。
 */
export function useEditorValue(
  facade: EditorFacade,
  props: EditorValueProps,
  emit: EditorValueEmit,
) {
  const { formItem } = useFormItem();

  const innerValue = computed(() => props.modelValue ?? '');
  let currentValue = '';

  /** 把外部值灌进文档；由调用方在 `facade.view` 就绪后调用一次，之后随 `modelValue` 变化触发 */
  const syncFromProps = () => {
    if (innerValue.value === currentValue) return;
    currentValue = innerValue.value;
    facade.setContent(innerValue.value);
  };

  /** 文档变更后回抛给外部，由 `dispatchTransaction` 调用 */
  const onValueChange = () => {
    const nextValue = facade.getContent();
    if (nextValue === currentValue) return;
    currentValue = nextValue;
    emit('update:modelValue', currentValue);
    emit('change', currentValue);
  };

  watch(innerValue, syncFromProps);

  watch(
    () => props.modelValue,
    () => {
      if (props.validateEvent) {
        formItem?.validate?.(CHANGE_EVENT).catch(debugWarn);
      }
    },
  );

  /** 文档为空时显示占位文字；读一下 `version` 建立依赖，否则空文档不会触发重算 */
  const placeholderVisible = computed(() => {
    void facade.version.value;
    return facade.isDocEmpty();
  });

  return { placeholderVisible, onValueChange, syncFromProps };
}
