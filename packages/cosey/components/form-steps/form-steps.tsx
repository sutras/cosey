import {
  computed,
  defineComponent,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  useModel,
} from 'vue';
import { ElButton, ElStep, ElSteps } from 'element-plus';
import { reactiveOmit } from '@vueuse/core';
import {
  type FormBubbleContext,
  formBubbleContextSymbol,
  useFormContainers,
  useFormContext,
} from '../form';
import { createBem, isNumber } from '../../utils';
import { useLocale } from '../../hooks';
import {
  type FormStepEntry,
  type FormStepsActionContext,
  type FormStepsContext,
  type FormStepsExpose,
  formStepsContextSymbol,
  formStepsEmits,
  formStepsProps,
  formStepsSlots,
} from './form-steps.api';

export default defineComponent({
  name: 'CoFormSteps',
  inheritAttrs: false,
  props: formStepsProps,
  slots: formStepsSlots,
  emits: formStepsEmits,
  setup(props, { attrs, emit, slots, expose }) {
    const bem = createBem('form-steps');

    const { t } = useLocale();

    const formContext = useFormContext();

    /**
     * 弹窗/抽屉的上下文。有它（即处在 `FormDialog` / `FormDrawer` 里）时：
     * 1. 底部按钮由弹窗统一提供，本组件不再自己渲染一套；
     * 2. 把「步骤控制器」注册过去，让弹窗的确定按钮在前几步变成「下一步」。
     */
    const formBubbleContext = inject<FormBubbleContext | null>(formBubbleContextSymbol, null);

    const elStepsProps = reactiveOmit(
      props,
      'modelValue',
      'switchToInvalid',
      'resetOnOpen',
      'clickable',
      'showStatus',
      'bodyMinHeight',
    );

    /**
     * 当前步骤。用 vue 内置的 `useModel`：父级绑了 `v-model` 时受控，
     * 没绑时退回组件内部状态 —— 「下一步」「打开复位」这类**内部**切换在两种用法下都成立。
     */
    const innerValue = useModel(props, 'modelValue');

    const { orderedEntries, addEntry, refreshOrder, validateEntry } =
      useFormContainers<FormStepEntry>({
        formContext,
        enabled: () => props.showStatus,
        switchToInvalid: () => props.switchToInvalid,
        onInvalid: (entry) => goTo(orderedEntries.value.indexOf(entry)),
        onRemoved: () => ensureActive(),
      });

    const total = computed(() => orderedEntries.value.length);

    /** 序号夹到有效范围内：步骤被 `v-if` 摘掉后，原序号可能已经越界 */
    const clampIndex = (index: number) => {
      if (!total.value) {
        return 0;
      }

      return Math.min(Math.max(index, 0), total.value - 1);
    };

    const current = computed(() => clampIndex(innerValue.value ?? 0));

    const isFirst = computed(() => current.value <= 0);
    const isLast = computed(() => !total.value || current.value >= total.value - 1);

    const goTo = (index: number) => {
      const target = clampIndex(index);

      if (target === innerValue.value) {
        return;
      }

      innerValue.value = target;
    };

    const prev = () => {
      if (!isFirst.value) {
        goTo(current.value - 1);
      }
    };

    /** 校验当前步骤，不通过时滚到出错字段（当前步骤的字段一定是可见的） */
    const validateCurrent = async () => {
      const valid = await validateEntry(orderedEntries.value[current.value]);

      if (!valid) {
        formContext?.scrollToInvalid();
      }

      return valid;
    };

    const next = async () => {
      // 最后一步没有「下一步」，交回给调用方（弹窗的确定按钮会走 submit）
      if (isLast.value) {
        return validateCurrent();
      }

      const valid = await validateCurrent();

      if (!valid) {
        return false;
      }

      goTo(current.value + 1);

      return true;
    };

    /**
     * 步骤被移除后把当前序号收回来。
     *
     * 不处理的话会停在一个已经没有内容的序号上（`el-steps` 的 active 大于步骤数），
     * 用户看到的是**所有步骤都不是激活态 + 内容区空白**。
     *
     * ⚠️ 只在**移除**时调用，**注册时不能调**：多个步骤是逐个 setup 注册的，
     * 第一个注册时其余还没进来，会把这个「暂时越界的序号」误判成失效。
     */
    const ensureActive = () => {
      const clamped = clampIndex(innerValue.value ?? 0);

      if (clamped !== innerValue.value) {
        innerValue.value = clamped;
      }
    };

    const actionContext = computed<FormStepsActionContext>(() => ({
      current: current.value,
      total: total.value,
      isFirst: isFirst.value,
      isLast: isLast.value,
      prev,
      next,
      submitting: formContext?.submitting ?? false,
      submit: () => formContext?.submit() ?? Promise.resolve(),
    }));

    provide<FormStepsContext>(formStepsContextSymbol, {
      addStep: addEntry,
      isActive: (uid) => orderedEntries.value[current.value]?.uid === uid,
    });

    // 交给弹窗底部：确定按钮在前几步变成「下一步」，并补一个「上一步」
    if (formBubbleContext) {
      const cancelSteps = formBubbleContext.registerSteps(() => actionContext.value);

      onBeforeUnmount(cancelSteps);
    }

    const handleOpen = () => {
      if (!props.resetOnOpen) {
        return;
      }

      refreshOrder();
      goTo(0);
    };

    let cancelOpen: (() => void) | undefined;

    onMounted(() => {
      refreshOrder();
      cancelOpen = formContext?.onOpen(handleOpen);

      // 非弹窗/抽屉场景：接管提交按钮，让 `co-form` 收起自己的「提交 + 重置」行。
      // 弹窗里按钮由弹窗底部统一提供（走 registerSteps），这里不要动。
      if (!formBubbleContext) {
        formContext?.setHasSteps(true);
      }
    });

    onBeforeUnmount(() => {
      cancelOpen?.();

      if (!formBubbleContext) {
        formContext?.setHasSteps(false);
      }
    });

    expose<FormStepsExpose>({
      get current() {
        return current.value;
      },
      get total() {
        return total.value;
      },
      get isFirst() {
        return isFirst.value;
      },
      get isLast() {
        return isLast.value;
      },
      get submitting() {
        return formContext?.submitting ?? false;
      },
      submit: () => formContext?.submit() ?? Promise.resolve(),
      goTo,
      prev,
      next,
      validateCurrent,
    });

    /** 把步骤自己的 title / description 插槽转发给 el-step；不传时让 el-step 用属性兜底 */
    const getStepSlots = (entry: FormStepEntry) => {
      const stepSlots: Record<string, () => unknown> = {};

      if (entry.slots.title) {
        stepSlots.title = () => entry.slots.title?.();
      }

      if (entry.slots.description) {
        stepSlots.description = () => entry.slots.description?.();
      }

      return stepSlots;
    };

    /**
     * 状态自己算，不用 `el-step` 的自动推算。
     *
     * `el-step` 把状态缓存在内部，只在 `active` 变化时重算 —— 而步骤被 `v-if` 增删后
     * **序号会整体挪位**：挪位后的步骤状态不会重算，会停在 `wait`（实现在 2026-09-28 实测到）。
     * 自己按「序号 vs 当前序号」算一遍，增删、跳转都成立。
     */
    const getStepStatus = (entry: FormStepEntry, index: number) => {
      // 使用者显式传了 status 就以他为准
      if (entry.props.status) {
        return entry.props.status;
      }

      if (props.showStatus && entry.errorCount) {
        return 'error';
      }

      if (index < current.value) {
        return props.finishStatus;
      }

      return index === current.value ? props.processStatus : 'wait';
    };

    return () => {
      const { class: attrsClass, style: attrsStyle, ...restAttrs } = attrs as Record<string, any>;
      const actions = actionContext.value;

      // 在弹窗/抽屉里默认不渲染操作区：按钮由弹窗底部统一提供，免得两套按钮打架
      const showActions = !!slots.actions || !formBubbleContext;

      return (
        <div class={[bem.b(), bem.is('clickable', props.clickable), attrsClass]} style={attrsStyle}>
          <ElSteps
            {...restAttrs}
            {...elStepsProps}
            active={current.value}
            onChange={(value: number, oldValue: number) => emit('change', value, oldValue)}
          >
            {orderedEntries.value.map((entry, index) => (
              <ElStep
                // key 里带上序号：序号一挪位就重建，`el-step` 内部的进度线才会跟着重算
                key={`${entry.uid}:${index}`}
                title={entry.props.title}
                description={entry.props.description}
                icon={entry.props.icon}
                status={getStepStatus(entry, index)}
                v-slots={getStepSlots(entry)}
                // el-step 没声明 click 事件，展开写才过得了类型检查
                {...{ onClick: props.clickable ? () => goTo(index) : undefined }}
              />
            ))}
          </ElSteps>

          <div
            class={bem.e('body')}
            style={{
              minHeight: isNumber(props.bodyMinHeight)
                ? `${props.bodyMinHeight}px`
                : props.bodyMinHeight,
            }}
          >
            {slots.default?.({})}
          </div>

          {showActions && (
            <div class={bem.e('actions')}>
              {slots.actions ? (
                slots.actions(actions)
              ) : (
                <>
                  {!actions.isFirst && (
                    <ElButton onClick={actions.prev}>{t('co.form.prev')}</ElButton>
                  )}
                  {actions.isLast ? (
                    <ElButton
                      type="primary"
                      {...props.submitProps}
                      loading={actions.submitting}
                      onClick={actions.submit}
                    >
                      {t(props.submitText)}
                    </ElButton>
                  ) : (
                    <ElButton type="primary" onClick={actions.next}>
                      {t('co.form.next')}
                    </ElButton>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      );
    };
  },
});
