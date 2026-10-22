import { computed, defineComponent, inject, nextTick, ref, toValue, watch } from 'vue';
import {
  ElButton,
  ElCheckbox,
  ElDialog,
  ElDrawer,
  ElIcon,
  ElTag,
  ElTooltip,
  formItemContextKey,
} from 'element-plus';
import { ArrowDown, CircleClose } from '@element-plus/icons-vue';
import { reactiveComputed } from '@vueuse/core';
import { get, isObject, merge } from 'lodash-es';
import { tableSelectEmits, tableSelectProps, tableSelectSlots } from './table-select.api';
import { Table, defaultTableConfig } from '../table';
import { useConfig } from '../config-provider';
import { createBem } from '../../utils';
import { useLocale, useProps } from '../../hooks';

type FetchSelected = (values: any[]) => Promise<any[]> | any[];

// 同一轮里多个实例的取值合并成一次请求：一行一个选择器时不会一人一发
const fetchQueues = new WeakMap<
  FetchSelected,
  { values: Set<any>; waiters: ((rows: any[]) => void)[] }
>();

const fetchSelectedInQueue = (fetcher: FetchSelected, values: any[]) => {
  return new Promise<any[]>((resolve) => {
    let queue = fetchQueues.get(fetcher);

    if (!queue) {
      queue = { values: new Set(), waiters: [] };
      fetchQueues.set(fetcher, queue);

      const current = queue;

      queueMicrotask(() => {
        fetchQueues.delete(fetcher);

        Promise.resolve()
          .then(() => fetcher([...current.values]))
          .then((rows) => current.waiters.forEach((waiter) => waiter(rows || [])))
          .catch(() => current.waiters.forEach((waiter) => waiter([])));
      });
    }

    values.forEach((value) => queue!.values.add(value));
    queue.waiters.push(resolve);
  });
};

export default defineComponent({
  name: 'CoTableSelect',
  inheritAttrs: false,
  props: tableSelectProps,
  slots: tableSelectSlots,
  emits: tableSelectEmits,
  setup(props, { slots, emit, attrs }) {
    const bem = createBem('table-select');

    const { t } = useLocale();

    const { aliasProps, getLabel, getValue } = useProps(props);

    const formItem = inject(formItemContextKey, undefined);

    const tableConfig = useConfig()?.table;

    const visible = ref(false);

    // 首次打开才挂载弹层：一行一个选择器时不必先建一堆 ElDialog
    const mounted = ref(false);

    const tableRef = ref<any>();

    // 值 -> 行；值来自接口之外的初始 modelValue 时靠它回显标签
    const rowCache = ref<Map<any, any>>(new Map());

    // 弹窗内的临时选中集，点确定才写回 modelValue
    const pending = ref<Map<any, any>>(new Map());

    // 当前页数据，供表头全选使用
    const pageRows = ref<any[]>([]);

    const ensuring = ref(false);

    // 触发器直接复用 el-select 的类名与结构，悬停/聚焦态由这两个类驱动
    const hovering = ref(false);

    const focused = ref(false);

    const valueKey = computed(() => aliasProps.value.value);

    const size = computed(() => props.size || formItem?.size || 'default');

    // el-select 的小尺寸标签用 small，其余用 default
    const tagSize = computed(() => (size.value === 'small' ? 'small' : 'default'));

    const tableKeys = reactiveComputed(() => {
      return merge({}, defaultTableConfig.keys, toValue(tableConfig)?.keys, props.keys);
    });

    const pagination = computed(() => {
      if (props.pagination === false) {
        return false;
      }

      return {
        layout: 'prev, pager, next, sizes, total',
        ...(isObject(props.pagination) ? props.pagination : null),
      };
    });

    const toValues = (value: any): any[] => {
      if (Array.isArray(value)) {
        return value;
      }

      return value === undefined || value === null || value === '' ? [] : [value];
    };

    const placeholderRow = (value: any) => ({ [valueKey.value]: value });

    const getRow = (value: any) => {
      return rowCache.value.get(value) ?? pending.value.get(value) ?? placeholderRow(value);
    };

    const getRowLabel = (row: any) => {
      const text = getLabel(row);

      return text === undefined || text === null || text === ''
        ? `${getValue(row) ?? ''}`
        : `${text}`;
    };

    // 只有值、没有行时用 fetchSelected 补齐，否则标签只能显示原始值
    const ensureSelected = async () => {
      if (ensuring.value) {
        return;
      }

      const values = toValues(props.modelValue);
      const unknown = values.filter((value) => !rowCache.value.has(value));

      if (!unknown.length) {
        return;
      }

      if (!props.fetchSelected) {
        unknown.forEach((value) => rowCache.value.set(value, placeholderRow(value)));
        return;
      }

      ensuring.value = true;

      try {
        const rows = (await fetchSelectedInQueue(props.fetchSelected, unknown)) || [];
        const wanted = new Set(unknown);

        // 合并请求会带回别的实例的值，只留自己那份
        rows.forEach((row) => {
          const value = getValue(row);

          if (wanted.has(value)) {
            rowCache.value.set(value, row);
          }
        });
      } catch {
        // 回显失败时保留原始值，不阻塞使用
      } finally {
        unknown.forEach((value) => {
          if (!rowCache.value.has(value)) {
            rowCache.value.set(value, placeholderRow(value));
          }
        });

        ensuring.value = false;
      }
    };

    watch(
      () => props.modelValue,
      () => {
        void ensureSelected();

        formItem?.validate('change').catch(() => {});
      },
      { immediate: true, deep: true },
    );

    const displayRows = computed(() => toValues(props.modelValue).map((value) => getRow(value)));

    const hasValue = computed(() => displayRows.value.length > 0);

    const visibleTags = computed(() => {
      return displayRows.value.slice(0, Math.max(props.maxTagCount, 0));
    });

    const restTags = computed(() => displayRows.value.slice(Math.max(props.maxTagCount, 0)));

    const placeholder = computed(() => props.placeholder || t('co.common.pleaseSelect'));

    // 与 el-select 一致：悬停或聚焦时，清空按钮顶替箭头
    const showClear = computed(() => {
      return (
        props.clearable && !props.disabled && hasValue.value && (focused.value || hovering.value)
      );
    });

    // 表格响应：借机记下当前页，供表头全选使用
    const wrappedTransformResponse = (res: any) => {
      const next = props.transformResponse ? props.transformResponse(res) : res;
      const list = tableKeys.list ? get(next, tableKeys.list) : next;

      pageRows.value = Array.isArray(list) ? list : [];

      return next;
    };

    const rowKey = computed(() => {
      const key = props.rowKey ?? aliasProps.value.value;

      return typeof key === 'function' ? key : (row: any) => get(row, key as string);
    });

    const pendingValues = computed(() => [...pending.value.keys()]);

    const pendingRows = computed(() => pendingValues.value.map((value) => getRow(value)));

    const pageAllChecked = computed(() => {
      return (
        pageRows.value.length > 0 && pageRows.value.every((row) => pending.value.has(getValue(row)))
      );
    });

    const pageIndeterminate = computed(() => {
      return (
        !pageAllChecked.value && pageRows.value.some((row) => pending.value.has(getValue(row)))
      );
    });

    const toggleRow = (row: any) => {
      if (!row) {
        return;
      }

      const value = getValue(row);

      if (props.multiple) {
        if (pending.value.has(value)) {
          pending.value.delete(value);
        } else {
          pending.value.set(value, row);
        }

        return;
      }

      pending.value.clear();
      pending.value.set(value, row);
    };

    const togglePage = () => {
      if (pageAllChecked.value) {
        pageRows.value.forEach((row) => pending.value.delete(getValue(row)));
        return;
      }

      pageRows.value.forEach((row) => pending.value.set(getValue(row), row));
    };

    const clearPending = () => {
      pending.value.clear();
    };

    const open = () => {
      if (props.disabled || visible.value) {
        return;
      }

      pending.value = new Map(displayRows.value.map((row) => [getValue(row), row]));

      void ensureSelected();

      if (!mounted.value) {
        mounted.value = true;

        // 先挂载再置为可见，弹层才能走一次打开动画
        void nextTick(() => {
          visible.value = true;
          emit('visible-change', true);
        });

        return;
      }

      visible.value = true;
      emit('visible-change', true);
    };

    const close = () => {
      visible.value = false;
      emit('visible-change', false);
    };

    const onCancel = () => {
      close();
      emit('cancel');
    };

    const onConfirm = () => {
      const values = pendingValues.value;

      values.forEach((value) => rowCache.value.set(value, getRow(value)));

      if (props.multiple) {
        const rows = values.map((value) => getRow(value));

        emit('update:modelValue', values);
        emit('change', values, rows);
        emit('confirm', values, rows);
      } else {
        const value = values[0];
        const rows = value === undefined ? [] : [getRow(value)];

        emit('update:modelValue', value);
        emit('change', value, rows);
        emit('confirm', value, rows);
      }

      close();
    };

    const onClear = () => {
      const value = props.multiple ? [] : undefined;

      rowCache.value.clear();
      emit('update:modelValue', value);
      emit('change', value, []);
      emit('clear');
    };

    const onClearClick = (event: MouseEvent) => {
      event.stopPropagation();
      onClear();
    };

    // 点标签上的叉只去掉那一个值
    const removeValue = (value: any) => {
      rowCache.value.delete(value);

      const values = toValues(props.modelValue).filter((item) => item !== value);
      const rows = values.map((item) => getRow(item));

      emit('update:modelValue', values);
      emit('change', values, rows);
    };

    const onClosed = () => {
      pageRows.value = [];
    };

    const onTriggerKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    };

    const onBlur = () => {
      formItem?.validate('blur').catch(() => {});
    };

    // 选择列：多选给复选框、单选给单选框，都不依赖 el-table 的 selection 列
    const renderRowCheck = (row: any) => {
      return (
        <span class={bem.e('cell')} onClick={(event: MouseEvent) => event.stopPropagation()}>
          <ElCheckbox
            modelValue={pending.value.has(getValue(row))}
            disabled={props.disabled}
            onChange={() => toggleRow(row)}
          />
        </span>
      );
    };

    const renderRowRadio = (row: any) => {
      return (
        <span
          class={bem.e('cell')}
          onClick={(event: MouseEvent) => {
            event.stopPropagation();
            toggleRow(row);
          }}
        >
          <span
            class={[
              bem.e('radio'),
              bem.is('checked', pending.value.has(getValue(row))),
              bem.is('disabled', props.disabled),
            ]}
          ></span>
        </span>
      );
    };

    const selectionColumn = computed(() => {
      if (!props.multiple) {
        return {
          width: 48,
          align: 'center' as const,
          slots: { default: ({ row }: any) => renderRowRadio(row) },
        };
      }

      return {
        width: 48,
        align: 'center' as const,
        slots: {
          header: () => (
            <div
              class={bem.e('cell')}
              onClick={(event: MouseEvent) => {
                event.stopPropagation();
                togglePage();
              }}
            >
              <ElCheckbox
                modelValue={pageAllChecked.value}
                indeterminate={pageIndeterminate.value}
              />
            </div>
          ),
          default: ({ row }: any) => renderRowCheck(row),
        },
      };
    });

    const mergedColumns = computed(() => {
      return [selectionColumn.value, ...(props.columns || [])] as any[];
    });

    const rowClassName = ({ row }: { row: any }) => {
      return !props.multiple && pending.value.has(getValue(row)) ? bem.e('picked') : '';
    };

    const tableAttrs = computed(() => {
      const batch = props.tableProps?.batch;

      return {
        api: props.api,
        formProps: props.formProps,
        transformParams: props.transformParams,
        transformResponse: wrappedTransformResponse,
        keys: props.keys,
        pagination: pagination.value,
        // 抽屉占满视口高度，表格跟着撑开；弹窗由内容高度决定，留 60vh 免得顶到屏幕外
        height: props.drawer ? 'calc(100vh - 176px)' : '60vh',
        toolbarConfig: false,
        ...props.tableProps,
        // 选中态由选择器自己维护，交给表格的批量条展示
        batch:
          batch === false ? false : { ...(isObject(batch) ? batch : {}), rows: pendingRows.value },
        columns: mergedColumns.value,
        rowKey: rowKey.value,
        rowClassName: props.tableProps?.rowClassName ?? rowClassName,
        onRowClick: toggleRow,
      } as Record<string, any>;
    });

    // 标签、清空、箭头全部走 el-select 的类名与自有图标，尺寸/配色跟着 element-plus 走
    const renderTag = (row: any, index: number) => {
      const value = getValue(row);

      return (
        <div class="el-select__selected-item" key={index}>
          <ElTag
            type="info"
            size={tagSize.value}
            disable-transitions
            closable={props.multiple && props.clearable && !props.disabled}
            onClose={() => removeValue(value)}
          >
            <span class="el-select__tags-text">
              {slots.tag ? slots.tag({ row, index }) : getRowLabel(row)}
            </span>
          </ElTag>
        </div>
      );
    };

    const renderTags = () => {
      if (!hasValue.value) {
        return <div class="el-select__placeholder is-transparent">{placeholder.value}</div>;
      }

      return (
        <>
          {visibleTags.value.map((row, index) => renderTag(row, index))}
          {restTags.value.length ? (
            <ElTooltip
              placement="top"
              content={restTags.value.map((row) => getRowLabel(row)).join('、')}
            >
              <div class="el-select__selected-item">
                <ElTag type="info" size={tagSize.value} disable-transitions>
                  <span class="el-select__tags-text">+{restTags.value.length}</span>
                </ElTag>
              </div>
            </ElTooltip>
          ) : null}
        </>
      );
    };

    const renderSingle = () => {
      const row = displayRows.value[0];

      return (
        <div class={['el-select__placeholder', { 'is-transparent': !row }]}>
          <span>
            {row ? (slots.label ? slots.label({ row }) : getRowLabel(row)) : placeholder.value}
          </span>
        </div>
      );
    };

    const renderTrigger = () => {
      return (
        <div
          class={[bem.e('trigger'), 'el-select', `el-select--${size.value}`]}
          onMouseenter={() => (hovering.value = true)}
          onMouseleave={() => (hovering.value = false)}
        >
          <div
            class={[
              'el-select__wrapper',
              {
                'is-focused': focused.value,
                'is-hovering': hovering.value,
                'is-disabled': props.disabled,
              },
            ]}
            tabindex={props.disabled ? undefined : 0}
            onClick={open}
            onKeydown={onTriggerKeydown}
            onFocus={() => (focused.value = true)}
            onBlur={() => {
              focused.value = false;
              onBlur();
            }}
          >
            <div class="el-select__selection">{props.multiple ? renderTags() : renderSingle()}</div>
            <div class="el-select__suffix">
              {showClear.value ? (
                <ElIcon
                  class="el-select__caret el-select__icon el-select__clear"
                  {...{ onClick: onClearClick }}
                >
                  <CircleClose />
                </ElIcon>
              ) : (
                <ElIcon
                  class={['el-select__caret', 'el-select__icon', { 'is-reverse': visible.value }]}
                >
                  <ArrowDown />
                </ElIcon>
              )}
            </div>
          </div>
        </div>
      );
    };

    const renderFooter = () => {
      return (
        <div class={bem.e('footer')}>
          <ElButton onClick={onCancel}>{t('co.common.cancel')}</ElButton>
          <ElButton type="primary" onClick={onConfirm}>
            {t('co.common.confirm')}
          </ElButton>
        </div>
      );
    };

    const renderBatch = () => {
      return (
        <>
          {slots.batch?.({
            rows: pendingRows.value,
            count: pending.value.size,
            clear: clearPending,
          })}
          {pending.value.size ? (
            <ElButton link type="primary" onClick={clearPending}>
              {t('co.common.clear')}
            </ElButton>
          ) : null}
        </>
      );
    };

    const renderTable = () => {
      return (
        <Table ref={tableRef} {...tableAttrs.value}>
          {{ batch: renderBatch }}
        </Table>
      );
    };

    const renderModal = () => {
      if (!mounted.value) {
        return null;
      }

      const baseProps = {
        modelValue: visible.value,
        'onUpdate:modelValue': (value: boolean) => {
          visible.value = value;
        },
        title: props.title || placeholder.value,
        destroyOnClose: true,
        appendToBody: true,
        onClosed,
      };

      if (props.drawer) {
        return (
          <ElDrawer
            {...(baseProps as any)}
            {...(props.drawerProps as any)}
            size={props.width}
            class={bem.e('drawer')}
          >
            {{
              default: renderTable,
              footer: renderFooter,
            }}
          </ElDrawer>
        );
      }

      const width = typeof props.width === 'number' ? `${props.width}px` : props.width;

      return (
        <ElDialog
          {...(baseProps as any)}
          {...(props.dialogProps as any)}
          width={width}
          top="8vh"
          class={bem.e('dialog')}
        >
          {{
            default: renderTable,
            footer: renderFooter,
          }}
        </ElDialog>
      );
    };

    return () => {
      return (
        <div class={bem.b()} {...attrs}>
          {renderTrigger()}
          {renderModal()}
        </div>
      );
    };
  },
});
