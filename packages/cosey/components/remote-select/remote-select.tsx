import { computed, defineComponent, nextTick, ref, toValue } from 'vue';
import { reactiveComputed } from '@vueuse/core';
import { get, merge, omit } from 'lodash-es';
import { ElOption, ElPagination, ElSelect, PaginationProps } from 'element-plus';
import { remoteSelectEmits, remoteSelectProps, remoteSelectSlots } from './remote-select.api';
import { useConfig } from '../config-provider';
import { defaultTableConfig } from '../table';
import {
  bulkBindEvents,
  createLoading,
  filterEmptyFormValue,
  isFunction,
  isObject,
  auid,
  createBem,
} from '../../utils';
import { useFetch, useProps } from '../../hooks';
import { TableQuery } from '../table-query';
import { type TableQueryExpose } from '..';

export default defineComponent({
  name: 'CoRemoteSelect',
  inheritAttrs: false,
  props: remoteSelectProps,
  slots: remoteSelectSlots,
  emits: remoteSelectEmits,
  setup(props, { slots, emit, attrs }) {
    const bem = createBem('remote-select');

    const tableConfig = useConfig()?.table;

    // data
    const isFirstFetch = ref(true);

    const tableData = ref<any[]>([]);

    const tableQueryRef = ref<TableQueryExpose>();

    const tableKeys = reactiveComputed(() => {
      return merge({}, defaultTableConfig.keys, toValue(tableConfig)?.keys, props.keys);
    });

    const getFetchParams = () => {
      const params = {
        ...filterEmptyFormValue(tableQueryRef.value?.getFieldsValue() || {}),
      };

      return filterEmptyFormValue(props.transformParams?.(params) || params);
    };

    const getFullFetchParams = () => {
      return {
        [tableKeys.page]: page.value,
        [tableKeys.pageSize]: pageSize.value,
        ...getFetchParams(),
      };
    };

    let loading: ReturnType<typeof createLoading>;

    const { isFetching, execute } = useFetch(
      () => {
        loading = createLoading(`.${popperId}`);
        const params = getFullFetchParams();
        return props.api?.(params);
      },
      {
        immediate: props.immediate,
        onSuccess(res) {
          tableData.value = (tableKeys.list ? get(res, tableKeys.list) : res) || [];
          total.value = +get(res, tableKeys.total) || 0;

          const el = document.querySelector(`.${popperId} .el-scrollbar__wrap`) as HTMLElement;
          if (el) {
            el.scrollTop = 0;
          }
        },
        onFinally() {
          isFirstFetch.value = false;
          loading?.close();
        },
      },
    );

    // pagination
    const pagination = reactiveComputed(() => {
      return merge(
        {},
        defaultTableConfig.pagination,
        {
          layout: 'prev, pager, next',
        },
        toValue(tableConfig)?.pagination,
        isObject(props.pagination) ? props.pagination : null,
      );
    });

    const total = ref(0);
    const page = ref<number>(pagination.currentPage);
    const pageSize = ref<number>(pagination.pageSize);

    const paginationProps = computed<Partial<PaginationProps> | false>(() => {
      if (props.pagination === false) {
        return false;
      }
      return {
        ...pagination,
        total: total.value,
      };
    });

    const onPageSizeChange = () => {
      page.value = 1;
    };

    const onPageChange = () => {
      execute();
    };

    // form query
    const onSubmit = async () => {
      if (!isFetching.value) {
        page.value = 1;
        await execute();
      }
    };

    const onReset = async () => {
      if (!isFetching.value) {
        page.value = 1;
        await execute();
      }
    };

    // visible
    const onVisibleChange = (visible: boolean) => {
      emit('visible-change', visible);
      if (visible) {
        if (isFirstFetch.value && !props.immediate) {
          execute();
        }

        nextTick(() => {
          headerRef.value?.querySelector('input')?.focus();
        });
      }
    };

    const headerRef = ref<HTMLElement>();

    const { getLabel, getValue, getKey } = useProps(props);

    // loading
    const popperId = auid();

    const events = bulkBindEvents(remoteSelectEmits, emit);

    const selectProps = computed(() => {
      return omit(props, [
        'optionProps',
        'api',
        'pagination',
        'formProps',
        'transformParams',
        'keys',
        'immediate',
      ]);
    });

    return () => {
      return (
        <ElSelect
          {...attrs}
          {...selectProps.value}
          {...events}
          class={bem.b()}
          popper-class={[bem.e('popper'), popperId, selectProps.value.popperClass].join(' ')}
          onVisible-change={onVisibleChange}
        >
          {{
            ...slots,
            header: props.formProps
              ? () => {
                  return (
                    <>
                      {slots.headerBefore ? slots.headerBefore({}) : null}
                      <div
                        ref={headerRef}
                        onKeydown={(event) => {
                          if ((event as KeyboardEvent).key === 'Enter') {
                            event.preventDefault();
                          }
                        }}
                      >
                        <TableQuery
                          ref={tableQueryRef}
                          inline
                          grid={false}
                          size="small"
                          class={bem.e('form')}
                          width={120}
                          {...props.formProps}
                          reset={onReset}
                          submit={onSubmit}
                        ></TableQuery>
                      </div>
                      {slots.headerAfter ? slots.headerAfter({}) : null}
                    </>
                  );
                }
              : null,
            default: () => {
              return tableData.value.map((row, index) => {
                const value = getValue(row);
                const label = getLabel(row);
                const key = getKey(value);

                const optionProps = props.optionProps;

                return (
                  <ElOption
                    key={key}
                    value={value}
                    label={label}
                    {...(isFunction(optionProps) ? optionProps(row, index) : optionProps)}
                  >
                    {slots.option ? slots.option({ option: row, index }) : null}
                  </ElOption>
                );
              });
            },
            footer: paginationProps.value
              ? () => (
                  <ElPagination
                    size="small"
                    hideOnSinglePage
                    {...paginationProps.value}
                    v-model:current-page={page.value}
                    v-model:page-size={pageSize.value}
                    style="--el-pagination-bg-color: transparent; --el-pagination-button-disabled-bg-color: transparent;"
                    onSize-change={onPageSizeChange}
                    onChange={onPageChange}
                  ></ElPagination>
                )
              : null,
          }}
        </ElSelect>
      );
    };
  },
});
