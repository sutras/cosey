<template>
  <component :is="template"></component>
</template>

<script lang="tsx" setup generic="T extends FormListRow">
import {
  computed,
  defineComponent,
  inject,
  isVNode,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  watch,
} from 'vue';
import type { PropType } from 'vue';
import { ElButton, ElSpace, ElTable, ElTableColumn, type FormItemRule } from 'element-plus';
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
  type FormItemWidth,
  type FormItemPresetWidth,
  getFormItemWidth,
  mapFormItemWidth,
  type FormContext,
  formContextSymbol,
} from '../form';
import { DndSort, DndSortItem } from '../dnd-sort';
import { TransitionGroup as InternalTransitionGroup } from '../transition-group';
import { useRowDrag } from '../../hooks/useRowDrag';
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
import { RtiDelete, RtiDragHandle, RtiPlus } from 'richtext-icons';

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
  'layout',
  'tableProps',
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

/**
 * 缓存 `getProp()` 的结果：同一个路径每次返回**同一个数组**。
 *
 * 否则表格每次渲染都会造出全新的 `prop` 数组，`co-form-item` 的 `prop` 属性
 * 按引用比较就永远「变了」，`shouldUpdateComponent` 失效 —— 整张表的输入框
 * 都会跟着重渲一遍。
 */
const propCache = new Map<string, string[]>();

const getProp = (...args: (string | number)[]) => {
  const arr = isString(props.prop)
    ? props.prop.split('.')
    : Array.isArray(props.prop)
      ? props.prop
      : [];
  const path = [...arr, ...args.map(String)];
  const key = JSON.stringify(path);

  let cached = propCache.get(key);

  if (!cached) {
    cached = path;
    propCache.set(key, cached);
  }

  return cached;
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

// table 布局
const tableLayout = computed(() => props.layout === 'table');

const rootRef = ref<HTMLElement | null>(null);

useRowDrag({
  enabled: () => tableLayout.value && !!props.draggable && !mergedReadonly.value,
  rootRef,
  onMove: move,
  // 行内全是输入框，必须只让手柄可拖，否则在输入框里按下鼠标会变成拖整行
  handle: `.${bem.e('drag-handle')}`,
});

/**
 * el-table 的 `$index` 是「当前 data 里的位置」，一旦排序/筛选就和 `modelValue`
 * 的下标错开，所以先按行对象认一下，认不出再退回 `$index`。
 */
const resolveCellIndex = (row: T, index: number) => {
  if (props.modelValue[index] === row) {
    return index;
  }

  const found = props.modelValue.indexOf(row);

  return found < 0 ? index : found;
};

/**
 * 单元格的渲染边界。
 *
 * 默认插槽原本是在 el-table 的 render 里执行的：造 vnode 时读了 `row.name`，
 * 等于让 el-table 的 render effect 订阅了**每一行的每个字段** —— 改一个字符，
 * 整张表（所有行、所有格子）全部重渲。
 *
 * 套一层组件之后，字段的读取发生在单元格自己的 render effect 里：el-table 只看到
 * `row` 这个对象引用，一次输入只会重渲「被改的那一行」的那几个格子。
 */
const FormListCell = defineComponent({
  name: 'CoFormListCell',
  props: {
    row: { type: Object as PropType<FormListRow>, required: true },
    index: { type: Number, required: true },
    columnIndex: { type: Number, required: true },
  },
  setup(cellProps) {
    return () => {
      const nodes = slots.default?.({
        row: cellProps.row as T,
        index: cellProps.index,
        getProp: getProp.bind(getProp, cellProps.index),
      });

      return Array.isArray(nodes) ? (nodes[cellProps.columnIndex] ?? null) : null;
    };
  },
});

const renderCell = (row: T, index: number, columnIndex: number) => {
  // el-table 收集嵌套列时会用 `{ row: {}, $index: -1 }` 调一次默认插槽，
  // 那一次不能把假数据交给用户
  if (index < 0) {
    return null;
  }

  return <FormListCell row={row} index={resolveCellIndex(row, index)} columnIndex={columnIndex} />;
};

/** 列的字段名：显式声明的优先，否则取表单项 prop 的末段 */
const getColumnProp = (column: any) => {
  if (isString(column.prop)) {
    return column.prop;
  }

  if (Array.isArray(column.prop)) {
    return column.prop[column.prop.length - 1];
  }

  return undefined;
};

const getColumnWidth = (width?: FormItemWidth) => {
  if (isNumber(width)) {
    return width;
  }

  const preset = mapFormItemWidth[width as FormItemPresetWidth];

  if (isNumber(preset)) {
    return preset;
  }

  return isString(width) ? width : undefined;
};

const tableColumns = computed(() => {
  return (columns.value as any[]).map((column) => {
    return {
      label: column.label,
      prop: getColumnProp(column),
      width: getColumnWidth(column.width),
      align: column.align,
      headerAlign: column.headerAlign || column.align,
      required: column.required,
    };
  });
});

const renderAddButton = () => {
  return (
    <ElButton class={bem.e('add')} link type="primary" onClick={handleAdd}>
      <Icon class={bem.e('plus-icon')}>
        <RtiPlus />
      </Icon>
      {t(props.addText)}
    </ElButton>
  );
};

const renderTable = () => {
  return (
    <div ref={rootRef} class={[bem.b(), bem.is('table')]}>
      <ElTable
        border
        {...props.tableProps}
        data={props.modelValue}
        rowKey={getKey}
        class={bem.e('table')}
      >
        {props.draggable && !mergedReadonly.value && (
          <ElTableColumn width={36} align="center" class-name={bem.e('drag-column')}>
            {{
              default: ({ $index }: any) =>
                $index < 0 ? null : (
                  <span class={bem.e('drag-handle')}>
                    <Icon size="lg">
                      <RtiDragHandle />
                    </Icon>
                  </span>
                ),
            }}
          </ElTableColumn>
        )}
        {tableColumns.value.map((column, columnIndex) => {
          return (
            <ElTableColumn
              prop={column.prop}
              width={column.width}
              align={column.align}
              headerAlign={column.headerAlign}
              class-name={bem.e('cell')}
            >
              {{
                header: () => (
                  <div class={[bem.e('title'), bem.is('required', column.required)]}>
                    {column.label}
                  </div>
                ),
                default: ({ row, $index }: any) => renderCell(row, $index, columnIndex),
              }}
            </ElTableColumn>
          );
        })}
        {!mergedReadonly.value && showRemoveButton.value && (
          <ElTableColumn width={48} align="center" class-name={bem.e('action')}>
            {{
              default: ({ $index }: any) =>
                $index < 0 ? null : (
                  <ElButton link type="danger" onClick={() => remove($index)}>
                    <Icon size="lg">
                      <RtiDelete />
                    </Icon>
                  </ElButton>
                ),
            }}
          </ElTableColumn>
        )}
      </ElTable>
      {!mergedReadonly.value && showAddButton.value && renderAddButton()}
    </div>
  );
};

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
      ) : tableLayout.value ? (
        renderTable()
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
            {!mergedReadonly.value && showAddButton.value && renderAddButton()}
          </div>
        </div>
      )}
    </FormItem>
  );
});
</script>
