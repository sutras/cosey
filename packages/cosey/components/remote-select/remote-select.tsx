import { computed, defineComponent, nextTick, onBeforeUnmount, ref, toValue, watch } from 'vue';
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
import { useFetch, useLocale, useProps } from '../../hooks';
import { FormQuery, type FormQueryExpose } from '../form-query';

export default defineComponent({
  name: 'CoRemoteSelect',
  inheritAttrs: false,
  props: remoteSelectProps,
  slots: remoteSelectSlots,
  emits: remoteSelectEmits,
  setup(props, { slots, emit, attrs }) {
    const bem = createBem('remote-select');

    const tableConfig = useConfig()?.table;

    const { t } = useLocale();

    const popperId = auid();

    const { getLabel, getValue, getKey } = useProps(props);

    // data
    const isFirstFetch = ref(true);

    const tableData = ref<any[]>([]);

    const tableQueryRef = ref<FormQueryExpose>();

    const tableKeys = reactiveComputed(() => {
      return merge({}, defaultTableConfig.keys, toValue(tableConfig)?.keys, props.keys);
    });

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

    // 滚动加载：'scroll' 时不做页码分页，滚到底部追加下一页
    const isScrollMode = computed(() => props.pagination === 'scroll');

    // 上一页返回的条数，接口没给总数时用它判断还有没有下一页
    const lastPageSize = ref(0);

    const hasMore = computed(() => {
      if (total.value) {
        return tableData.value.length < total.value;
      }

      return lastPageSize.value >= pageSize.value;
    });

    let scrollEl: HTMLElement | null = null;

    // search
    const searchKeyword = ref('');

    let searchTimer: ReturnType<typeof setTimeout> | undefined;

    const toSearchParams = (keyword: string) => {
      if (!keyword) {
        return {};
      }

      return isFunction(props.searchParam)
        ? props.searchParam(keyword)
        : { [props.searchParam]: keyword };
    };

    const getFetchParams = () => {
      const params = {
        ...filterEmptyFormValue(tableQueryRef.value?.getFieldsValue() || {}),
        ...toSearchParams(searchKeyword.value),
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

    // 请求进行中再次触发的动作不能丢：记下来，等本次结束后按最新参数补一次
    let pendingFetch = false;

    // 这次请求查的是第几页：用它决定「追加」还是「替换」，重置中途到达的响应也不会串
    let fetchingPage = 1;

    const { isFetching, error, execute } = useFetch(
      () => {
        // 触底加载用列表底部那行报进度，不再盖遮罩
        if (!isScrollMode.value) {
          loading = createLoading(`.${popperId}`);
        }

        const params = getFullFetchParams();

        fetchingPage = page.value;

        return props.api?.(params);
      },
      {
        immediate: props.immediate,
        onSuccess(res) {
          const list = (tableKeys.list ? get(res, tableKeys.list) : res) || [];
          const append = isScrollMode.value && fetchingPage > 1;

          tableData.value = append ? [...tableData.value, ...list] : list;
          lastPageSize.value = list.length;
          total.value = +get(res, tableKeys.total) || 0;

          if (append) {
            return;
          }

          const el = document.querySelector(`.${popperId} .el-scrollbar__wrap`) as HTMLElement;
          if (el) {
            el.scrollTop = 0;
          }
        },
        onFinally() {
          isFirstFetch.value = false;
          loading?.close();

          if (pendingFetch) {
            pendingFetch = false;
            execute();
          }
        },
      },
    );

    const fetchData = () => {
      if (isFetching.value) {
        pendingFetch = true;
        return;
      }

      execute();
    };

    // 从头查（搜索、筛选、重置都走这里）
    const resetAndFetch = () => {
      page.value = 1;
      fetchData();
    };

    const loadMore = () => {
      if (!isScrollMode.value || isFetching.value || !hasMore.value) {
        return;
      }

      page.value += 1;
      execute();
    };

    const onScroll = () => {
      if (!scrollEl || isFetching.value || !hasMore.value) {
        return;
      }

      if (scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 16) {
        loadMore();
      }
    };

    const unbindScroll = () => {
      scrollEl?.removeEventListener('scroll', onScroll);
      scrollEl = null;
    };

    const bindScroll = () => {
      if (!isScrollMode.value) {
        return;
      }

      const el = document.querySelector(`.${popperId} .el-scrollbar__wrap`) as HTMLElement | null;

      if (!el || el === scrollEl) {
        return;
      }

      unbindScroll();

      scrollEl = el;
      el.addEventListener('scroll', onScroll, { passive: true });
    };

    const onSearchInput = (keyword?: string) => {
      const next = `${keyword ?? ''}`.trim();

      clearTimeout(searchTimer);

      searchTimer = setTimeout(() => {
        if (next === searchKeyword.value) {
          return;
        }

        searchKeyword.value = next;
        emit('search', next);
        resetAndFetch();
      }, props.searchDebounce);
    };

    onBeforeUnmount(() => {
      clearTimeout(searchTimer);
      unbindScroll();
    });

    // 已选项缓存：选中时记住整行，翻页/搜索后仍能渲染出标签
    const selectedCache = ref<Map<any, any>>(new Map());

    watch(
      [() => props.modelValue, tableData],
      () => {
        const value = props.modelValue;
        const values = Array.isArray(value)
          ? value
          : value === undefined || value === null
            ? []
            : [value];

        if (!values.length) {
          return;
        }

        tableData.value.forEach((row) => {
          const rowValue = getValue(row);

          if (values.includes(rowValue)) {
            selectedCache.value.set(rowValue, row);
          }
        });
      },
      { deep: true },
    );

    // 已选但不在当前列表里的项，固定在列表顶部
    const pinnedRows = computed(() => {
      if (!props.multiple) {
        return [] as any[];
      }

      const values = Array.isArray(props.modelValue) ? props.modelValue : [];

      if (!values.length) {
        return [] as any[];
      }

      const loadedValues = new Set(tableData.value.map((row) => getValue(row)));

      return values
        .filter((value) => !loadedValues.has(value))
        .map((value) => selectedCache.value.get(value))
        .filter(Boolean);
    });

    const paginationProps = computed<Partial<PaginationProps> | false>(() => {
      if (props.pagination === false || isScrollMode.value) {
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
      fetchData();
    };

    // form query
    const onSubmit = () => {
      resetAndFetch();
    };

    const onReset = () => {
      resetAndFetch();
    };

    // visible
    const onVisibleChange = (visible: boolean) => {
      emit('visible-change', visible);
      if (visible) {
        if (isFirstFetch.value && !props.immediate) {
          fetchData();
        }

        nextTick(() => {
          headerRef.value?.querySelector('input')?.focus();
          bindScroll();
        });
      } else {
        unbindScroll();
      }
    };

    const headerRef = ref<HTMLElement>();

    const events = bulkBindEvents(remoteSelectEmits, emit);

    const selectProps = computed(() => {
      return {
        ...omit(props, [
          'optionProps',
          'api',
          'pagination',
          'formProps',
          'transformParams',
          'keys',
          'immediate',
          'searchable',
          'searchParam',
          'searchDebounce',
        ]),
        filterable: props.filterable || props.searchable,
      };
    });

    // searchable 时接管输入框：阻止 element-plus 的本地过滤，改为带着关键字请求接口
    const filterMethod = computed(() => {
      if (props.filterMethod) {
        return props.filterMethod;
      }

      if (!props.searchable) {
        return undefined;
      }

      return (keyword: string) => {
        onSearchInput(keyword);
        return true;
      };
    });

    const customEmpty = computed(() => {
      return !slots.empty && !!error.value;
    });

    const renderOption = (row: any, index: number) => {
      const value = getValue(row);
      const label = getLabel(row);
      const optionProps = props.optionProps;

      return (
        <ElOption
          key={getKey(value)}
          class={index === 0 && pinnedRows.value.length ? bem.e('divider') : ''}
          value={value}
          label={label}
          {...(isFunction(optionProps) ? optionProps(row, index) : optionProps)}
        >
          {slots.option ? slots.option({ option: row, index }) : null}
        </ElOption>
      );
    };

    // 滚动加载的列表末尾：可点，列表不足一屏时也能翻页
    const renderMore = () => {
      const loadingMore = isFetching.value;

      return (
        <li
          class={[bem.e('more'), bem.is('loading', loadingMore), bem.is('done', !hasMore.value)]}
          role="presentation"
          onClick={() => loadMore()}
        >
          {loadingMore
            ? t('co.common.loading')
            : hasMore.value
              ? t('co.common.loadMore')
              : t('co.common.noMore')}
        </li>
      );
    };

    const renderEmpty = () => {
      return (
        <div class={bem.e('error')} onClick={() => fetchData()}>
          <span>{t('co.common.loadFailed')}</span>
          <span class={bem.e('retry')}>{t('co.common.reload')}</span>
        </div>
      );
    };

    return () => {
      return (
        <ElSelect
          {...attrs}
          {...selectProps.value}
          {...events}
          {...(filterMethod.value ? { filterMethod: filterMethod.value } : {})}
          loading={props.loading || (isFetching.value && !tableData.value.length)}
          class={bem.b()}
          popper-class={[bem.e('popper'), popperId, selectProps.value.popperClass].join(' ')}
          onVisible-change={onVisibleChange}
        >
          {{
            ...slots,
            ...(customEmpty.value ? { empty: renderEmpty } : {}),
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
                        <FormQuery
                          ref={tableQueryRef}
                          inline
                          grid={false}
                          size="small"
                          class={bem.e('form')}
                          width={120}
                          {...props.formProps}
                          reset={onReset}
                          submit={onSubmit}
                        ></FormQuery>
                      </div>
                      {slots.headerAfter ? slots.headerAfter({}) : null}
                    </>
                  );
                }
              : null,
            default: () => {
              return [
                ...pinnedRows.value.map((row) => {
                  return (
                    <ElOption
                      key={`pinned-${getKey(getValue(row))}`}
                      class={bem.e('pinned')}
                      value={getValue(row)}
                      label={getLabel(row)}
                      {...(isFunction(props.optionProps)
                        ? props.optionProps(row, -1)
                        : props.optionProps)}
                    >
                      {slots.option ? slots.option({ option: row, index: -1 }) : null}
                    </ElOption>
                  );
                }),
                ...tableData.value.map((row, index) => renderOption(row, index)),
                ...(isScrollMode.value && tableData.value.length ? [renderMore()] : []),
              ];
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
