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
  createBem,
} from '../../utils';
import { getCssVar } from '../../utils';
import { useLocale } from '../../hooks';
import { RtiDelete, RtiPlus } from 'richtext-icons';

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

const bem = createBem('form-list');

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
        <div class={bem.b()}>
          {props.modelValue.length > 0 && (
            <ElSpace
              class={[bem.e('space'), bem.is('head')]}
              style={{
                marginInlineStart: props.draggable ? getCssVar('margin-lg') : '',
              }}
              size={[16, 16]}
            >
              {columns.value.map((column: any) => {
                return (
                  <div
                    class={[bem.e('title'), bem.is('required', column.required)]}
                    style={getFormItemWidth(column.width)}
                  >
                    {column.label}
                  </div>
                );
              })}
            </ElSpace>
          )}
          <div class={bem.e('content')}>
            <DndSort disabled={!props.draggable} onMove={move}>
              <InternalTransitionGroup effect="slide">
                {props.modelValue.map((row, index) => {
                  return (
                    <DndSortItem key={getKey(row)} index={index} class={bem.e('sort-item')}>
                      <ElSpace size={[16, 16]} class={bem.e('space')}>
                        {slots.default?.({
                          row,
                          index,
                          getProp: getProp.bind(getProp, index),
                        })}
                        {!mergedReadonly.value && showRemoveButton.value && (
                          <ElButton link type="danger" onClick={() => remove(index)}>
                            <Icon size="lg">
                              <RtiDelete />
                            </Icon>
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
                <Icon class={bem.e('plus-icon')}>
                  <RtiPlus />
                </Icon>
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
