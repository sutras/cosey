import { reactiveOmit, type Arrayable } from '@vueuse/core';
import {
  type FormExpose,
  type FormContext,
  type FormProps,
  type FormInvalidFields,
  type FormValidateChangeHandler,
  type FormValidateChangeReason,
  formExposeKeys,
  formContextSymbol,
  formPropsOmit,
} from './form.api';
import { nextTick, provide, reactive, ref, toRef, useTemplateRef } from 'vue';
import { type FormInstance, type FormItemProp, type FormValidationResult } from 'element-plus';
import { createMergedExpose } from '../../utils';

export interface UseFormTemplateOptions<T> {
  omittedProps?: (keyof T)[];
}

export function useFormTemplate<T extends FormProps, U extends FormExpose = FormExpose>(
  props: T,
  options: UseFormTemplateOptions<T> = {},
) {
  const elFormProps = reactiveOmit(props, ...formPropsOmit, ...(options.omittedProps || []));

  // 解决 form-list 重置无效
  const resetList: (() => void)[] = [];
  const addResetField = (reset: () => void) => {
    resetList.unshift(reset);
  };
  const removeResetField = (reset: () => void) => {
    resetList.splice(resetList.indexOf(reset), 1);
  };

  // 校验状态变化通知：表单内部组件（如 co-form-tabs / co-form-group）靠它做响应
  const validateChangeHandlers: FormValidateChangeHandler[] = [];

  const onValidateChange = (handler: FormValidateChangeHandler) => {
    validateChangeHandlers.push(handler);

    return () => {
      const index = validateChangeHandlers.indexOf(handler);

      if (index > -1) {
        validateChangeHandlers.splice(index, 1);
      }
    };
  };

  const openHandlers: (() => void)[] = [];

  const onOpen = (handler: () => void) => {
    openHandlers.push(handler);

    return () => {
      const index = openHandlers.indexOf(handler);

      if (index > -1) {
        openHandlers.splice(index, 1);
      }
    };
  };

  const elFormRef = useTemplateRef<FormInstance>('form');

  const getFields = () => elFormRef.value?.fields || [];

  /**
   * 从 el-form 的 fields 推导**全量**出错字段，而不是用 el-form 回调给的那份。
   * 回调里的集合只包含「本次校验涉及的字段」，做徽标、完成度这类状态展示时会漏。
   */
  const getInvalidFields = (): FormInvalidFields => {
    const invalidFields: FormInvalidFields = {};

    getFields().forEach((field) => {
      if (field.validateState !== 'error') {
        return;
      }

      invalidFields[field.propString] = field.validateMessage || true;
    });

    return invalidFields;
  };

  /** 按文档顺序找出第一个「可见的」出错字段，不可见的（折叠/未激活页签）滚了也没用 */
  const findInvalidFieldEl = (invalidFields: FormInvalidFields) => {
    const invalidProps = Object.keys(invalidFields);

    if (!invalidProps.length) {
      return undefined;
    }

    const els = getFields()
      .filter((field) => field.$el && invalidProps.includes(field.propString))
      .map((field) => field.$el as HTMLElement)
      .sort((a, b) => {
        if (a === b) {
          return 0;
        }

        return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
      });

    return els.find((el) => el.getClientRects().length > 0);
  };

  const scrollToInvalid = (invalidFields: FormInvalidFields = getInvalidFields()) => {
    const el = findInvalidFieldEl(invalidFields);

    if (!el) {
      return;
    }

    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  const notifyValidateChange = (reason: FormValidateChangeReason) => {
    const invalidFields = getInvalidFields();

    validateChangeHandlers.forEach((handler) => {
      handler(invalidFields, reason);
    });

    if (reason === 'validate' && Object.keys(invalidFields).length) {
      // 等容器（页签/折叠组）自己切完、DOM 更新完再滚，否则滚的是切换前的旧位置
      nextTick(() => {
        requestAnimationFrame(() => scrollToInvalid());
      });
    }
  };

  // 字段实时校验会短时间内触发多次（同一批字段一起变），合并到同一个微任务里只通知一次
  let fieldChangePending = false;

  const reportFieldChange = () => {
    if (fieldChangePending) {
      return;
    }

    fieldChangePending = true;

    Promise.resolve().then(() => {
      fieldChangePending = false;
      notifyValidateChange('field');
    });
  };

  /**
   * 校验指定字段（不传则整个表单），返回是否通过。
   * 不直接用 el-form 的 validate/validateField，是为了把「通知」收敛到 notifyValidateChange 一处。
   */
  const validateFields = async (
    modelProps?: Arrayable<FormItemProp>,
    reason: FormValidateChangeReason = 'validate',
  ) => {
    const instance = elFormRef.value;

    if (!instance) {
      return false;
    }

    try {
      const targetProps = modelProps ? (Array.isArray(modelProps) ? modelProps : [modelProps]) : [];

      if (targetProps.length) {
        await instance.validateField(targetProps);
      } else {
        await instance.validate();
      }

      notifyValidateChange(reason);

      return true;
    } catch {
      notifyValidateChange(reason);

      return false;
    }
  };

  const submitting = ref(false);

  /** 是否有分步容器接管了提交按钮（见 `co-form-steps`） */
  const hasSteps = ref(false);

  const setHasSteps = (value: boolean) => {
    hasSteps.value = value;
  };

  const formContext = reactive({
    colProps: toRef(() => props.colProps),
    grid: toRef(() => props.grid),
    readonly: toRef(() => props.readonly),
    width: toRef(() => props.width),
    addResetField,
    removeResetField,
    onValidateChange,
    onOpen,
    getInvalidFields,
    getFields,
    validateFields,
    scrollToInvalid,
    reportFieldChange,
    // 用 getter 延迟到调用时再取：`submit` 声明在后面，闭包解析时它已经就绪
    get submit() {
      return submit;
    },
    get submitting() {
      return submitting.value;
    },
    setHasSteps,
    hasSteps,
  });

  provide<FormContext>(formContextSymbol, formContext);

  const notifyOpen = () => {
    openHandlers.forEach((handler) => {
      handler();
    });
  };

  const resetFields = () => {
    elFormRef.value?.resetFields();

    resetList.forEach((reset) => {
      reset();
    });
  };

  const reset = (callback?: () => void) => {
    resetFields();
    callback?.();
    props.reset?.();
  };

  const clearValidate = () => {
    elFormRef.value?.clearValidate();
  };

  const submit = async (throwError?: boolean) => {
    if (submitting.value) {
      return;
    }
    submitting.value = true;
    try {
      try {
        await elFormRef.value?.validate();
      } catch (invalidFields) {
        // 校验没通过：通知订阅者（如 co-form-tabs 切到含出错字段的页签），并保持原本的抛出行为
        notifyValidateChange('validate');
        throw invalidFields;
      }
      await props.submit?.();
    } catch (error) {
      if (throwError === true) {
        throw error;
      }
    } finally {
      submitting.value = false;
    }
  };

  /**
   * el-form 的 `validate` / `validateField` 在校验失败时的行为不一致：
   * 传了 callback 时走回调且不 reject，没传 callback 时才 reject。
   * 这里两种情况都转发给订阅者，同时保持各自原本的语义。
   * 注意：通知时给的是**全量**出错字段，不是回调里那份局部集合。
   */
  const validate: FormExpose['validate'] = (callback) => {
    const instance = elFormRef.value;

    if (!instance) {
      return Promise.resolve(false) as FormValidationResult;
    }

    if (typeof callback === 'function') {
      return instance.validate((isValid, invalidFields) => {
        notifyValidateChange('validate');
        callback(isValid, invalidFields);
      });
    }

    return instance.validate().then(
      (isValid) => {
        notifyValidateChange('validate');
        return isValid;
      },
      (invalidFields: FormInvalidFields) => {
        notifyValidateChange('validate');
        return Promise.reject(invalidFields);
      },
    );
  };

  const validateField: FormExpose['validateField'] = (modelProps, callback) => {
    const instance = elFormRef.value;

    if (!instance) {
      return Promise.resolve(false) as FormValidationResult;
    }

    if (typeof callback === 'function') {
      return instance.validateField(modelProps, (isValid, invalidFields) => {
        notifyValidateChange('validate-field');
        callback(isValid, invalidFields);
      });
    }

    return instance.validateField(modelProps).then(
      (isValid) => {
        notifyValidateChange('validate-field');
        return isValid;
      },
      (invalidFields: FormInvalidFields) => {
        notifyValidateChange('validate-field');
        return Promise.reject(invalidFields);
      },
    );
  };

  const customExpose = {
    submit,
    reset,
    validate,
    validateField,
    validateFields,
    scrollToInvalid,
    getInvalidFields,
  };

  const expose = createMergedExpose<U>(formExposeKeys, () => elFormRef.value, customExpose);

  return {
    elFormProps,
    elFormRef,
    /**
     * 本表单的上下文。注意 `inject` **不查自身**，所以像 `co-form-query` 这种
     * 「自己 provide 表单上下文」的组件必须用这个返回值，而不是再 `inject` 一次。
     */
    formContext,
    expose,
    reset,
    resetFields,
    clearValidate,
    submit,
    submitting,
    notifyOpen,
  };
}
