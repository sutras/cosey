<template>
  <component :is="template"></component>
</template>

<script lang="tsx" setup generic="T extends FormListRow">
import { computed, inject, isVNode, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue';
import { ElButton, ElSpace, type FormItemRule } from 'element-plus';
import { cloneDeep, omit } from 'lodash-es';
import { reactiveOmit } from '@vueuse/core';
import {
  type FormListExpose,
  formListExposeKeys,
  type FormListRow,
  type FormListProps,
  type FormListSlots,
  type FormListEmits,
  defaultFormListProps,
} from './form-list.api';
import { Icon } from '../icon';
import {
  FormItem,
  type FormItemExpose,
  type FormItemProps,
  getFormItemWidth,
  type FormContext,
  formContextSymbol,
} from '../form';
import { DndSort, DndSortItem } from '../dnd-sort';
import { TransitionGroup as InternalTransitionGroup } from '../transition-group';
import {
  auid,
  createMergedExpose,
  isNumber,
  isString,
  arrayMove,
  defineTemplate,
} from '../../utils';
import useStyle from './form-list.style';
import { useComponentConfig } from '../config-provider';
import { useToken } from '../theme';
import { useLocale } from '../../hooks';

defineOptions({
  name: 'CoFormList',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<FormListProps<T>>(), defaultFormListProps);

const slots = defineSlots<FormListSlots<T>>();

const emit = defineEmits<FormListEmits<T>>();

const attrs = useAttrs();

const formItemProps = reactiveOmit(
  props,
  'defaultValue',
  'min',
  'max',
  'draggable',
) as FormItemProps<'custom'>;

const { t } = useLocale();

const { prefixCls } = useComponentConfig('form-list', props);

const { hashId } = useStyle(prefixCls);

const { token } = useToken();

// readonly
const formContext = inject<FormContext | null>(formContextSymbol, null);

const mergedReadonly = computed(() => {
  return formContext?.readonly || props.readonly;
});

// key
let mapRowKey = new Map<T, string>();

watch(
  () => props.modelValue,
  () => {
    const newMapRowKey = new Map<T, string>();

    props.modelValue.forEach((row) => {
      let key = mapRowKey.get(row);
      if (!key) {
        key = auid();
      }
      newMapRowKey.set(row, key);
    });

    mapRowKey = newMapRowKey;
  },
  {
    immediate: true,
    flush: 'sync',
  },
);

// methods
const beforeEmit = (newValue: T[]) => {
  emit('update:modelValue', newValue);
  formItemRef.value?.validate('change');
};

const add = (row?: T, index?: number) => {
  let newRow = row ?? props.defaultValue ?? ({} as T);
  newRow = cloneDeep(newRow);

  const newValue = [...props.modelValue];
  index = isNumber(index) ? index : newValue.length;
  newValue.splice(index, 0, newRow);
  beforeEmit(newValue);
};

const remove = (index: number) => {
  const newValue = [...props.modelValue];
  newValue.splice(index, 1);
  beforeEmit(newValue);
};

const move = (fromIndex: number, toIndex: number) => {
  if (fromIndex === toIndex) return;
  const newValue = [...props.modelValue];
  arrayMove(newValue, fromIndex, toIndex);
  beforeEmit(newValue);
};

const handleAdd = () => {
  add(props.defaultValue);
};

// reset
let initialValue: any = undefined;

const reset = () => {
  formItemRef.value?.resetField();
  // 修复 element-plus 重置时因浅拷贝导致的问题
  emit('update:modelValue', cloneDeep(initialValue));
};

onMounted(() => {
  initialValue = cloneDeep(props.modelValue);
  formContext?.addResetField(reset);
});

onBeforeUnmount(() => {
  formContext?.removeResetField(reset);
});

// template
const formItemRef = ref<FormItemExpose>();

const getProp = (...args: (string | number)[]) => {
  const arr = isString(props.prop)
    ? props.prop.split('.')
    : Array.isArray(props.prop)
      ? props.prop
      : [];

  return [...arr, ...args.map(String)];
};

const getKey = (row: T) => {
  return mapRowKey.get(row) as string;
};

const showAddButton = computed(
  () => typeof props.max !== 'number' || props.modelValue.length < props.max,
);

const showRemoveButton = computed(
  () => typeof props.min !== 'number' || props.modelValue.length > props.min,
);

const columns = computed(() => {
  return (
    props.columns ??
    (
      slots.default?.({
        row: {} as T,
        index: 0,
        getProp,
      }) ?? []
    )
      .map((item: unknown) => {
        if (
          isVNode(item) &&
          ((item.type as any).name === 'ElFormItem' || (item.type as any).name === 'CoFormItem')
        ) {
          const props = item.props || {};
          return {
            ...props,
            required:
              props.required ||
              props.required === '' ||
              (Array.isArray(props.rules) ? props.rules : props.rules ? [props.rules] : []).some(
                (rule: FormItemRule) => !!rule.required,
              ),
          };
        }
        return;
      })
      .filter(Boolean)
  );
});

// expose
defineExpose<FormListExpose<T>>(
  createMergedExpose<FormListExpose<T>>(formListExposeKeys, () => formItemRef.value, {
    add,
    remove,
    move,
  }),
);

const template = defineTemplate(() => {
  return (
    <FormItem
      {...formItemProps}
      {...attrs}
      ref={formItemRef}
      v-slots={omit(slots, 'default', 'custom')}
    >
      {slots.custom ? (
        slots.custom({
          list: props.modelValue,
          getProp,
          getKey,
          add,
          remove,
          move,
        })
      ) : (
        <div class={[hashId.value, prefixCls.value]}>
          {props.modelValue.length > 0 && (
            <ElSpace
              class={[`${prefixCls.value}-space`, 'is-head']}
              style={{
                marginInlineStart: props.draggable ? token.value.marginLG + 'px' : '',
              }}
              size={[16, 16]}
            >
              {columns.value.map((column: any) => {
                return (
                  <div
                    class={[`${prefixCls.value}-title`, { 'is-required': column.required }]}
                    style={getFormItemWidth(column.width)}
                  >
                    {column.label}
                  </div>
                );
              })}
            </ElSpace>
          )}
          <div class={`${prefixCls.value}-content`}>
            <DndSort disabled={!props.draggable} onMove={move}>
              <InternalTransitionGroup effect="slide">
                {props.modelValue.map((row, index) => {
                  return (
                    <DndSortItem
                      key={getKey(row)}
                      index={index}
                      class={`${prefixCls.value}-sort-item`}
                    >
                      <ElSpace size={[16, 16]} class={`${prefixCls.value}-space`}>
                        {slots.default?.({
                          row,
                          index,
                          getProp: getProp.bind(getProp, index),
                        })}
                        {!mergedReadonly.value && showRemoveButton.value && (
                          <ElButton link type="danger" onClick={() => remove(index)}>
                            <Icon name="co:trash-can" size="lg" />
                          </ElButton>
                        )}
                      </ElSpace>
                    </DndSortItem>
                  );
                })}
              </InternalTransitionGroup>
            </DndSort>
            {!mergedReadonly.value && showAddButton.value && (
              <ElButton link type="primary" onClick={handleAdd}>
                <Icon name="co:add-large" class={`${prefixCls.value}-plus-icon`} />
                {t(props.addText)}
              </ElButton>
            )}
          </div>
        </div>
      )}
    </FormItem>
  );
});
</script>
