<template>
  <OptionalWrapper :when="formContext?.grid" :component="Col" :props="mergedColProps">
    <ElFormItem v-bind="mergedFormItemProps" ref="formItemRef" :class="bem.b()">
      <template v-if="label || slots.label" #label>
        <template v-if="label">{{ label }}</template>
        <slot v-else name="label"></slot>
        <ElTooltip v-if="tooltip || slots.tooltip" placement="top">
          <template #content>
            <template v-if="tooltip">{{ tooltip }}</template>
            <slot v-else name="tooltip"></slot>
          </template>
          <template #default>
            <Icon :class="bem.e('label-icon')" size="md"><RtiHelp /></Icon>
          </template>
        </ElTooltip>
      </template>
      <template #default>
        <div :class="bem.e('content')" :style="fixedWidthStyle">
          <slot>
            <Field
              :readonly="mergedReadonly"
              :type="fieldType"
              :component-props="mergedFieldProps"
              :component-slots="fieldSlots"
              :component-ref="fieldRef"
            />
          </slot>
          <div v-if="extra || slots.extra" :class="bem.e('extra')">
            <template v-if="extra">{{ extra }}</template>
            <slot v-else name="extra"></slot>
          </div>
        </div>
      </template>
      <template #error>
        <slot name="error"></slot>
      </template>
    </ElFormItem>
  </OptionalWrapper>
</template>

<script lang="tsx" setup generic="T extends FieldType">
/**
 * 为了能正确推断组件的属性和插槽，需要使用泛型组件；
 * 有两种泛型组件定义方式：
 *   1. setup generic
 *   2. defineComponent 函数签名
 * 理论上使用方式2可以用jsx灵活地传递插槽和属性到子组件，但泛型参数无法传递到插槽类型，且所有属性都变为必传，因此只能选择方式 1。
 */

import { computed, inject, mergeProps, ref, useAttrs } from 'vue';
import {
  type FormItemSlots,
  type FormItemEmits,
  type FormItemProps,
  formItemExposeKeys,
  exlucdeFieldSlotNames,
  defaultFormItemProps,
} from './form-item.api';
import { type FormContext, formContextSymbol } from './form.api';
import { type FieldType, Field } from '../field';
import { type FormQueryContext, formQueryContextSymbol } from '../form-query';
import { OptionalWrapper } from '../optional-wrapper';
import { Col } from '../col';
import { Icon } from '../icon';
import { useFormItemWidth } from './useFormItemWidth';
import {
  omitUndefined,
  createMergedExpose,
  isString,
  isNumber,
  toArray,
  createBem,
} from '../../utils';
import { ElFormItem, ElTooltip, type FormItemInstance } from 'element-plus';
import { reactiveOmit } from '@vueuse/core';
import { useLocale } from '../../hooks';
import { omit } from 'lodash-es';
import { RtiHelp } from 'richtext-icons';

defineOptions({
  name: 'CoFormItem',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<FormItemProps<T>>(), defaultFormItemProps);

const fieldType = computed(() => props.fieldType || 'input');

const slots = defineSlots<FormItemSlots<T>>();

const attrs = useAttrs() as any;

const emit = defineEmits<FormItemEmits>();

const bem = createBem('form-item');

const { t } = useLocale();

const formItemProps = reactiveOmit(
  props,
  'colProps',
  'width',
  'fieldType',
  'fieldProps',
  'fieldRef',
  'modelValue',
  'placeholder',
  'disabled',
  'readonly',
);

const formContext = inject<FormContext | null>(formContextSymbol, null);

const formItemRef = ref();

defineExpose<FormItemInstance>(createMergedExpose(formItemExposeKeys, () => formItemRef.value));

// form query
const formQueryContext = inject<FormQueryContext | null>(formQueryContextSymbol, null);

const hidden = computed(() => {
  return formQueryContext && formQueryContext.shouldHide(props.internalIndex!);
});

const mergedColProps = computed(() => {
  return mergeProps(
    {
      ...attrs,
      ...formContext?.colProps,
      ...props.colProps,
    },
    {
      style: {
        display: hidden.value ? 'none' : null,
      },
    },
  );
});

const fixedWidthStyle = useFormItemWidth(props, formContext);

const mergedRules = computed(() => {
  const { required } = props;
  const rules = toArray(props.rules || []);

  if (required !== undefined) {
    const requiredRules = rules
      .map((rule, i) => [rule, i] as const)
      .filter(([rule]) => Object.keys(rule).includes('required'));

    if (requiredRules.length > 0) {
      for (const [rule, i] of requiredRules) {
        if (rule.required === required) continue;
        rules[i] = { ...rule, required };
      }
    } else {
      rules.push({ required });
    }
  }

  const requiredMsg =
    isString(props.label) || isNumber(props.label)
      ? t('co.form.isRequired', {
          label: props.label,
        })
      : t('co.form.required');

  rules.forEach((rule) => {
    if (rule.required && !rule.message) {
      rule.message = requiredMsg;
    }
  });

  return rules;
});

const mergedFormItemProps = computed(() => {
  return {
    ...(formContext?.grid ? null : attrs),
    ...formItemProps,
    rules: mergedRules.value,
  };
});

const mergedFieldProps = computed(() => {
  return mergeProps(
    {
      disabled: props.disabled,
      modelValue: props.modelValue,
      'onUpdate:modelValue'(value: unknown) {
        emit('update:modelValue', value);
      },
      ...omitUndefined({
        placeholder: props.placeholder,
      }),
    },
    props.fieldProps || {},
  );
});

const mergedReadonly = computed(() => {
  return formContext?.readonly || props.readonly;
});

// slot
const fieldSlots = computed(() => {
  return {
    ...Object.fromEntries(exlucdeFieldSlotNames.map((name) => [name, slots[`field-${name}`]])),
    ...omit(slots, exlucdeFieldSlotNames),
    ...props.fieldSlots,
  };
});
</script>
