<template>
  <teleport to="body" :disabled="!isFullPage">
    <div
      ref="rootRef"
      v-loading="isFetching"
      :class="[
        hashId,
        prefixCls,
        {
          'is-fullpage': isFullPage,
          'is-split': isSplit,
        },
      ]"
      :style="{ ...containerStyle, zIndex }"
    >
      <div v-if="formProps" :class="`${prefixCls}-header`">
        <TableQuery ref="tableQuery" v-bind="formProps" :reset="onReset" :submit="onSubmit" />
      </div>

      <div v-if="$slots['before-body']" :class="`${prefixCls}-before-body`">
        <slot name="before-body"></slot>
      </div>

      <div v-if="$slots['before-body-plain']" :class="`${prefixCls}-before-body-plain`">
        <slot name="before-body-plain"></slot>
      </div>

      <div :class="`${prefixCls}-body`">
        <div
          v-if="
            $slots['toolbar-left'] ||
            $slots['toolbar-right'] ||
            mergedToolbarConfig ||
            isStatsVisible
          "
          :class="`${prefixCls}-toolbar`"
        >
          <div :class="`${prefixCls}-toolbar-left`">
            <slot name="toolbar-left"></slot>
            <div v-if="isStatsVisible" :class="`${prefixCls}-stats-wrapper`">
              <TableStats :columns="statsColumns" :data="statsData" />
            </div>
          </div>
          <div :class="`${prefixCls}-toolbar-right`">
            <slot name="toolbar-right"></slot>
            <div v-if="mergedToolbarConfig" :class="`${prefixCls}-toolbar-preset`">
              <div v-if="mergedToolbarConfig.reload">
                <el-tooltip
                  :content="t('co.common.reload')"
                  placement="top"
                  :show-after="200"
                  :hide-after="0"
                >
                  <el-button circle @click="reload">
                    <Icon
                      name="co:rotate-360"
                      size="md"
                      :class="[
                        `${prefixCls}-refresh-icon`,
                        {
                          'is-spinning': reloading,
                        },
                      ]"
                    />
                  </el-button>
                </el-tooltip>
              </div>

              <div v-if="mergedToolbarConfig.export">
                <el-tooltip
                  :content="t('co.table.exportThisPage')"
                  placement="top"
                  :show-after="200"
                  :hide-after="0"
                >
                  <el-button circle @click="exportVisible = true">
                    <Icon name="co:download" size="md" />
                  </el-button>
                </el-tooltip>

                <TableExport
                  v-model="exportVisible"
                  :title="t('co.table.exportData')"
                  :config="mergedToolbarConfig.export"
                  :columns="exportColumns"
                  :data="tableDataWithSummary"
                  :footer-count="footerCount"
                />
              </div>

              <div v-if="mergedToolbarConfig.fullScreen">
                <el-tooltip
                  :content="isFullPage ? t('co.table.exitFullScreen') : t('co.table.fullScreen')"
                  placement="top"
                  :show-after="200"
                  :hide-after="0"
                >
                  <el-button circle @click="onFullScreen">
                    <Icon :name="isFullPage ? 'co:fullscreen-exit' : 'co:fullscreen'" size="md" />
                  </el-button>
                </el-tooltip>
              </div>

              <div v-if="mergedToolbarConfig.setting">
                <el-tooltip
                  :content="t('co.table.columnSettings')"
                  placement="top"
                  :show-after="200"
                  :hide-after="0"
                >
                  <el-button ref="setting-ref" circle>
                    <Icon name="co:settings-adjust" size="md" />
                  </el-button>
                </el-tooltip>

                <TableColumnEditor
                  v-model="renderedColumns"
                  :virtual-ref="settingRef"
                  @reset="onColumnReset"
                />
              </div>
            </div>
          </div>
        </div>

        <div v-if="$slots['before-table']" :class="`${prefixCls}-before-table`">
          <slot name="before-table"></slot>
        </div>

        <div v-if="$slots['before-table-plain']" :class="`${prefixCls}-before-table-plain`">
          <slot name="before-table-plain"></slot>
        </div>

        <div :class="`${prefixCls}-table`" dir="ltr">
          <el-table
            ref="elTableRef"
            v-bind="elTableProps"
            :class="tableId"
            :data="tableData"
            :expand-row-keys="innerExpandRowKeys"
            :show-summary="false"
            :summary-method="undefined"
            :style="{ width: '100%' }"
            height="100%"
            max-height="none"
          >
            <template v-for="column in renderedColumns" :key="column.prop || column.property">
              <TableColumn v-bind="column" :internal-slot="$slots" />
            </template>
            <template v-for="name in passedElSlotsName" :key="name" #[name]="slotProps">
              <slot :name="name" v-bind="slotProps"></slot>
            </template>
            <teleport :to="`.${tableId} .el-table__inner-wrapper`" defer>
              <div
                v-if="showSummary && tableLayout === 'fixed'"
                v-show="!isEmpty"
                ref="footerWrapper2"
                v-mousewheel="handleHeaderFooterMousewheel"
                :class="ns.e('footer-wrapper')"
              >
                <table
                  :class="ns.e('footer')"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  :style="tableBodyStyles"
                >
                  <hColgroup
                    v-if="store"
                    :columns="store.states.columns"
                    :table-layout="tableLayout"
                  />
                  <table-footer
                    v-if="store"
                    :border="border"
                    :default-sort="defaultSort"
                    :store="store"
                    :sum-text="computedSumText"
                    :summary-method="summaryMethod"
                    :summary-properties="summaryProperties"
                    :transform-summary="transformSummary"
                  />
                </table>
              </div>
            </teleport>
          </el-table>
        </div>

        <el-pagination
          v-if="paginationProps"
          v-bind="paginationProps"
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :class="`${prefixCls}-pagination`"
          style="
            --el-pagination-bg-color: transparent;
            --el-pagination-button-disabled-bg-color: transparent;
          "
          @size-change="onPageSizeChange"
          @change="onPageChange"
        />
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { cloneDeep, get, merge } from 'lodash-es';
import {
  computed,
  CSSProperties,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  ref,
  unref,
  useTemplateRef,
  watch,
} from 'vue';
import { reactiveComputed, reactiveOmit } from '@vueuse/core';
import {
  type TableInstance,
  type PaginationProps,
  type TableColumnCtx,
  ElButton,
  useZIndex,
  useNamespace,
  Mousewheel as vMousewheel,
} from 'element-plus';
import {
  type TableSlots,
  type TableExpose,
  type ToolbarConfig,
  tableProps,
  tableExposeKeys,
  elSlotsName,
  omittedTableProps,
  defaultTableConfig,
  tableEmitEvents,
  tableEmitOnEvents,
} from './table';
import { type TableColumnProps } from './table-column/table-column.api';
import TableColumn from './table-column/table-column';
import TableColumnEditor from './table-column-editor/table-column-editor';
import TableQuery from './table-query/table-query';
import TableExport from './table-export/table-export';
import Icon from '../icon/icon';
import { useFetch, useFullPage, useResizeObserver } from '../../hooks';
import {
  addPxUnit,
  createMergedExpose,
  filterEmptyFormValue,
  flatColumns,
  getVNodeText,
  isFunction,
  isNullish,
  isObject,
  auid,
  walkTree,
} from '../../utils';
import { useConfig, useComponentConfig } from '../config-provider';

import useStyle from './table.style';
import { useLocale } from '../../hooks';
import { hColgroup } from 'element-plus/es/components/table/src/h-helper.mjs';
import TableFooter from './table-footer';
import { defaultSummaryMethod } from './table-footer/utils';
import TableStats from './table-stats/table-stats';
import { type TableQueryExpose } from './table-query/table-query.api';

defineOptions({
  name: 'CoTable',
});

const props = defineProps(tableProps);

const slots = defineSlots<TableSlots>();

const emit = defineEmits(tableEmitEvents);

const eventObject = tableEmitOnEvents.reduce(
  (obj, [name, onName]) => {
    obj[onName] = (...args: any[]) => {
      emit(name, ...args);
    };
    return obj;
  },
  {} as Record<string, (...args: any[]) => void>,
);

const { t } = useLocale();

const tableId = auid();

const { prefixCls } = useComponentConfig('table');

const { hashId } = useStyle(prefixCls);

const { table: tableConfig } = useConfig();

const tableKeys = reactiveComputed(() => {
  return merge({}, defaultTableConfig.keys, unref(tableConfig)?.keys, props.keys);
});

const isSplit = computed(() => {
  return props.split ?? unref(tableConfig)?.split ?? defaultTableConfig.split;
});

const passedElSlotsName = computed(() => {
  return elSlotsName.filter((name) => !!slots[name as keyof TableSlots]);
});

const elTableRef = ref<TableInstance>();
const tableQueryRef = useTemplateRef<TableQueryExpose>('tableQuery');

// order
const mapOrderType = {
  ascending: tableKeys.asc,
  descending: tableKeys.desc,
};

let orderParams: {
  [x: string]: string;
} | null = null;

const onSortChange = ({
  prop,
  order,
}: {
  prop: string;
  order: 'ascending' | 'descending' | null;
}) => {
  orderParams = order
    ? {
        [tableKeys.orderBy]: prop,
        [tableKeys.orderType]: mapOrderType[order],
      }
    : null;

  page.value = 1;
  execute();
};

// props
const elTableProps = computed(() => {
  return mergeProps(
    reactiveOmit(props, omittedTableProps),
    {
      onSortChange,
    },
    eventObject,
  );
});

const containerStyle = computed(() => {
  return {
    height: addPxUnit(props.height ?? unref(tableConfig)?.height ?? defaultTableConfig.height),
  };
});

// columns
const renderedColumns = ref<TableColumnProps[]>([]);

const setRenderedColumns = () => {
  renderedColumns.value = cloneDeep(
    [...props.columns, props.actionColumn].filter(isObject) as TableColumnProps[],
  );
};

const exportColumns = computed(() => {
  return renderedColumns.value?.filter((column) => {
    return (
      (!isNullish(column.prop || column.property) && (column.prop || column.property) !== '') ||
      (column.columns && column.columns.length > 0) ||
      column.type === 'index'
    );
  });
});

watch(
  [() => props.columns, () => props.actionColumn],
  () => {
    setRenderedColumns();
  },
  {
    immediate: true,
  },
);

const onColumnReset = () => {
  setRenderedColumns();
};

// data
const flattedColumns = computed(() => flatColumns(props.columns));

const tableData = ref(props.data || []);

watch(
  () => props.data,
  () => {
    tableData.value = props.data || [];
  },
);

const getData = () => {
  return tableData.value;
};

const setData = (data: any[]) => {
  tableData.value = data;
};

const tableDataWithSummary = computed(() => {
  const columns = flattedColumns.value.map((column) => {
    return {
      ...column,
      property: column.property || column.prop,
    };
  }) as TableColumnCtx[];

  const data = [...tableData.value];

  if (props.showSummary) {
    let sums = props.summaryMethod
      ? props.summaryMethod({
          columns: columns,
          data: tableData.value,
        })
      : defaultSummaryMethod(
          columns,
          data,
          props.sumText || t('co.table.total'),
          props.summaryProperties,
          props.transformSummary,
        );

    if (!Array.isArray(sums[0])) {
      sums = [sums];
    }

    data.push(
      ...sums.map((sum) =>
        sum
          .filter((_: any, index: number) => {
            return columns[index].type === 'selection' ? false : true;
          })
          .map((item: any) => getVNodeText(item)),
      ),
    );
  }
  return data;
});

const footerCount = computed(() => tableDataWithSummary.value.length - tableData.value.length);

const getFetchParams = () => {
  const params = {
    ...orderParams,
    ...filterEmptyFormValue(tableQueryRef.value?.getFieldsValue() || {}),
  };

  return filterEmptyFormValue(props.transformParams?.(params) || params);
};

const getPaginationParams = () =>
  props.pagination === false
    ? null
    : {
        [tableKeys.page]: page.value,
        [tableKeys.pageSize]: pageSize.value,
      };

const getFullFetchParams = () => ({
  ...getPaginationParams(),
  ...getFetchParams(),
});

const { isFetching, execute } = useFetch(
  () => {
    const params = getFullFetchParams();
    return Promise.all([props.api?.({ ...params }), props.parallelFetch?.({ ...params })]);
  },
  {
    immediate: false,
    onSuccess([res]) {
      res = props.transformResponse?.(res) || res;

      tableData.value = (tableKeys.list ? get(res, tableKeys.list) : res) || [];
      total.value = +get(res, tableKeys.total) || 0;

      if (!reloading.value) {
        elTableRef.value?.setScrollTop(0);
      }
    },
    onFinally() {
      reloading.value = false;
    },
  },
);

onMounted(() => {
  if (props.immediate && props.api) {
    execute();
  }
});

// footer
const ns = useNamespace('table');

const isEmpty = computed(() => (tableData.value || []).length === 0);

const handleHeaderFooterMousewheel = (_: any, data: any) => {
  const { pixelX, pixelY } = data;
  if (Math.abs(pixelX) >= Math.abs(pixelY)) {
    (elTableRef.value!.$refs.bodyWrapper as HTMLElement).scrollLeft += data.pixelX / 5;
  }
};

const tableBodyStyles = ref<CSSProperties>({});
const store = ref<any>(null);
const computedSumText = ref('');

const tableBodyRef = ref<HTMLElement | null>(null);

useResizeObserver(tableBodyRef, ({ inlineSize }) => {
  tableBodyStyles.value.width = inlineSize + 'px';
});

onMounted(() => {
  store.value = elTableRef.value!.store;
  computedSumText.value = elTableRef.value!.computedSumText;
  bindScrollEvent();

  tableBodyRef.value = document.querySelector(`.${tableId} .el-table__body`);
});

onBeforeUnmount(() => {
  unbindScrollEvent();
});

const footerWrapper2 = ref<HTMLElement | null>(null);

const scrollHander = (event: Event) => {
  if (footerWrapper2.value) {
    footerWrapper2.value.scrollLeft = (event.target as HTMLElement).scrollLeft;
  }
};

const bindScrollEvent = () => {
  document
    .querySelector(`.${tableId} .el-scrollbar__wrap`)
    ?.addEventListener('scroll', scrollHander);
};

const unbindScrollEvent = () => {
  document
    .querySelector(`.${tableId} .el-scrollbar__wrap`)
    ?.removeEventListener('scroll', scrollHander);
};

// pagination
const pagination = reactiveComputed(() => {
  return merge(
    {},
    defaultTableConfig.pagination,
    unref(tableConfig)?.pagination,
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

const getPagination = () => {
  return {
    page: page.value,
    pageSize: pageSize.value,
  };
};

// toolbar config
const defaultToolbarConfig = {
  reload: true,
  export: true,
  fullScreen: true,
  setting: true,
};

const mergedToolbarConfig = computed<false | ToolbarConfig>(() => {
  if (!props.toolbarConfig) {
    return false;
  }
  if (props.toolbarConfig === true) {
    return defaultToolbarConfig;
  }
  return {
    ...defaultToolbarConfig,
    ...props.toolbarConfig,
  };
});

// reload
const reloading = ref(false);

const reload = () => {
  if (!isFetching.value) {
    reloading.value = true;
    execute();
  }
};

// expand
const innerExpandRowKeys = ref<string[]>();

watch(
  () => props.expandRowKeys,
  () => {
    if (props.expandRowKeys) {
      innerExpandRowKeys.value = props.expandRowKeys;
    }
  },
  {
    immediate: true,
  },
);

const expandAll = () => {
  const ids: string[] = [];
  walkTree(tableData.value, 'children', (node) => {
    if (props.rowKey) {
      const key = isFunction(props.rowKey) ? props.rowKey(node) : props.rowKey;
      const id = get(node, key);
      ids.push(String(id));
    }
  });
  innerExpandRowKeys.value = ids;
};

const collapseAll = () => {
  innerExpandRowKeys.value = [];
};

// export
const exportVisible = ref(false);

// full page
const { nextZIndex } = useZIndex();

const { isFullPage, toggle } = useFullPage({
  fullscreen: true,
});

const zIndex = ref<number>();

const onFullScreen = () => {
  toggle();

  zIndex.value = isFullPage.value ? nextZIndex() : undefined;
};

// setting
const settingRef = useTemplateRef('setting-ref');

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

const submit = async () => {
  return props.formProps && tableQueryRef.value ? tableQueryRef.value.submit() : onSubmit();
};

const reset: TableExpose['reset'] = async (values) => {
  return props.formProps && tableQueryRef.value ? tableQueryRef.value.reset(values) : onReset();
};

// stats
const statsColumns = computed(() => unref(props.statsColumns));
const statsData = computed(() => unref(props.statsData));
const isStatsVisible = computed(() => statsColumns.value && statsColumns.value.length > 0);

// ref el
const rootRef = ref<HTMLElement | null>(null);

const getRootEl = () => rootRef.value;

// expose
const expose = createMergedExpose(
  tableExposeKeys,
  () => elTableRef.value,
  {
    reload,
    expandAll,
    collapseAll,
    getFetchParams,
    getFullFetchParams,
    setData,
    getData,
    getRootEl,
    getPagination,
    submit,
    reset,
  },
  () => tableQueryRef.value,
);

watch(
  () => props.getExpose,
  () => {
    props.getExpose?.(expose);
  },
  {
    immediate: true,
  },
);

defineExpose<TableExpose>(expose);
</script>
