import { nextTick, provide, ref, shallowRef, SlotsType, useModel } from 'vue';
import {
  type FormBubbleContext,
  type FormBubbleData,
  type FormBubbleSteps,
  formBubbleContextSymbol,
} from './form.api';
import { defineTemplate, createMergedExpose } from '../../utils';
import { type FormDialogButtonProps, type FormDialogSlots } from '../form-dialog';
import { ElButton } from 'element-plus';
import { useLocale } from '../../hooks';
import { UnwrapSlotsType } from '../../types/helper';

interface UseBubbleTemplateOptions {
  props: {
    modelValue?: boolean;
    beforeClose?: (done: () => void) => void;
  } & FormDialogButtonProps;
  slots: UnwrapSlotsType<SlotsType<FormDialogSlots>>;
  emit: {
    (event: 'update:modelValue', visible: boolean): void;
    (event: 'open'): void;
    (event: 'closed'): void;
  };
  exposeKeys: string[];
}

export function useBubbleTemplate(options: UseBubbleTemplateOptions) {
  const { props, emit, slots, exposeKeys } = options;

  const { t } = useLocale();

  const formBubbleData = ref<FormBubbleData>();

  /**
   * 弹窗显隐。用 vue 内置的 `useModel`：父级绑了 `v-model` 时受控（等父级回写，
   * 顺带支持 `v-model.trim` / `v-model.number` 这类修饰符），没绑时自动退回组件内部状态
   * —— 两种用法下 `cancel` / `confirm` 里的关闭都成立。
   *
   * ⚠️ `useModel` 依赖 `getCurrentInstance()`，所以 `useBubbleTemplate` 必须由组件
   * 在 `setup()` 里**同步**调用；挪进回调或异步分支会在 dev 下告警并静默失效，
   * 表现是弹窗**打不开**。
   */
  const visible = useModel(props, 'modelValue');

  let closeType: 'cancel' | 'confirm' | null = null;

  /**
   * 分步表单（`co-form-steps`）注册进来的控制器。
   *
   * 存的是**取值函数**而不是快照：步骤状态会变，弹窗底部的按钮要跟着变，
   * 所以每次用到时都重新取一遍（`buttonTemplate` 的渲染里读它，天然是响应式的）。
   */
  const stepsGetter = shallowRef<(() => FormBubbleSteps) | null>(null);

  const getSteps = () => stepsGetter.value?.() ?? null;

  const registerSteps = (getStepsValue: () => FormBubbleSteps) => {
    stepsGetter.value = getStepsValue;

    return () => {
      // 只清理自己注册的那份，避免后注册的步骤容器被提前卸载的那个误清
      if (stepsGetter.value === getStepsValue) {
        stepsGetter.value = null;
      }
    };
  };

  const cancel = () => {
    const done = () => {
      closeType = 'cancel';
      visible.value = false;
    };
    if (props.beforeClose) {
      props.beforeClose(done);
    } else {
      done();
    }
  };

  const confirm = async () => {
    const steps = getSteps();

    // 分步表单：还没到最后一步时，「确定」只负责校验当前步骤并前进
    if (steps && !steps.isLast) {
      await steps.next();
      return;
    }

    try {
      await formBubbleData.value?.submit(true);
      closeType = 'confirm';
      visible.value = false;
    } catch (err) {
      console.error(err);
    }
  };

  const elPopupRef = ref();

  const expose = createMergedExpose(exposeKeys, () => elPopupRef.value);

  const handleOpen = () => {
    nextTick(() => {
      // 弹窗内容是打开时才渲染的，这里的 nextTick 是等表单挂载完成
      formBubbleData.value?.clearValidate();
      formBubbleData.value?.notifyOpen?.();
    });
    emit('open');
  };

  const handleClosed = () => {
    switch (closeType) {
      case 'cancel':
        formBubbleData.value?.reset();
        break;
      default:
        formBubbleData.value?.resetFields();
        break;
    }
    closeType = null;
    emit('closed');
  };

  provide<FormBubbleContext>(formBubbleContextSymbol, {
    setFormBubbleData(data) {
      formBubbleData.value = data;
    },
    confirm,
    registerSteps,
  });

  const buttonTemplate = defineTemplate(() => {
    if (formBubbleData.value?.readonly) {
      return null;
    }

    const steps = getSteps();

    return (
      <div>
        {slots.button ? (
          slots.button({
            cancel,
            confirm,
            submitting: !!formBubbleData.value?.submitting,
            steps,
          })
        ) : (
          <>
            {steps && !steps.isFirst && (
              <ElButton onClick={() => steps.prev()}>{t('co.form.prev')}</ElButton>
            )}
            {!props.hideConfirm &&
              (steps && !steps.isLast ? (
                <ElButton type="primary" {...props.confirmProps} onClick={() => steps.next()}>
                  {t('co.form.next')}
                </ElButton>
              ) : (
                <ElButton
                  type="primary"
                  {...props.confirmProps}
                  loading={formBubbleData.value?.submitting}
                  onClick={confirm}
                >
                  {t(props.confirmText)}
                </ElButton>
              ))}
            {!props.hideCancel && !steps && (
              <ElButton {...props.cancelProps} onClick={cancel}>
                {t(props.cancelText)}
              </ElButton>
            )}
          </>
        )}
      </div>
    );
  });

  return {
    visible,
    handleOpen,
    handleClosed,
    expose,
    buttonTemplate,
    elPopupRef,
  };
}
