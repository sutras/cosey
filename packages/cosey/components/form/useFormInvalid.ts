import { inject, onBeforeUnmount, onMounted } from 'vue';
import { type FormItemContext } from 'element-plus';
import {
  formContextSymbol,
  type FormContext,
  type FormInvalidFields,
  type FormValidateChangeReason,
} from './form.api';

/** 取当前所在的表单上下文；组件脱离 co-form 单独使用时会拿到 null */
export function useFormContext() {
  return inject<FormContext | null>(formContextSymbol, null);
}

export interface InvalidContainer<T> {
  /** 命中后返回的值 */
  value: T;
  /** 用于判断归属的元素，返回空表示该容器当前不可用（未挂载 / 未渲染） */
  getEl: () => HTMLElement | undefined | null;
}

/**
 * 从出错字段反查它落在哪个容器里（页签 / 折叠组 / 列表）。
 *
 * 用 DOM 包含关系判断，而不是要求字段自己声明归属：
 * 这样不用改 `co-form-item`，`v-if` 动态字段、嵌套容器也天然正确。
 * 返回**第一个**命中的容器，所以不会在多个容器之间来回跳。
 */
export function locateInvalidContainer<T>(
  invalidFields: FormInvalidFields,
  fields: FormItemContext[],
  containers: InvalidContainer<T>[],
): T | undefined {
  const invalidProps = Object.keys(invalidFields);

  if (!invalidProps.length) {
    return undefined;
  }

  return containers.find((container) => {
    const el = container.getEl();

    if (!el) {
      return false;
    }

    return fields.some((field) => {
      if (!field.$el || !invalidProps.includes(field.propString)) {
        return false;
      }

      return el.contains(field.$el);
    });
  })?.value;
}

export interface InvalidResponseContext {
  /** 当前**全部**出错字段的快照，通过时为空对象 */
  invalidFields: FormInvalidFields;
  /** 当前所有表单项 */
  fields: FormItemContext[];
  /** 触发场景 */
  reason: FormValidateChangeReason;
}

/**
 * 订阅表单的校验状态变化。
 *
 * 建议只对 `reason === 'validate'` 的场景「打断用户」——
 * 那是用户点了提交/下一步，此时切容器、滚动是符合预期的；
 * 而 `'field'`（打字时 blur 触发的实时校验）只该用来更新状态展示，
 * 否则用户每填错一格就被切走，会非常烦。
 *
 * `formContext` 一般不用传，默认从 `inject` 取；但**自己 provide 表单上下文的组件**
 * （如 `co-form-query`）必须显式传入 —— `inject` 是查父级组件，拿不到自己 provide 的值。
 */
export function useInvalidResponse(
  respond: (context: InvalidResponseContext) => void,
  reasons: FormValidateChangeReason[] = ['validate'],
  formContext: FormContext | null = useFormContext(),
): FormContext | null {
  const context = formContext;

  if (!context) {
    return null;
  }

  let cancel: (() => void) | undefined;

  onMounted(() => {
    cancel = context.onValidateChange((invalidFields, reason) => {
      if (!reasons.includes(reason)) {
        return;
      }

      respond({
        invalidFields,
        fields: context.getFields(),
        reason,
      });
    });
  });

  onBeforeUnmount(() => {
    cancel?.();
  });

  return formContext;
}
