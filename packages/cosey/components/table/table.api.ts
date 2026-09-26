import { type PropType, type ExtractPropTypes, MaybeRef } from 'vue';
import { camelCase, omit, upperFirst } from 'lodash-es';
import { TableColumnCtx, type PaginationProps } from 'element-plus';
import elTableProps from 'element-plus/es/components/table/src/table/defaults.mjs';
import { type MayBeTableColumnProps } from './table-column/table-column.api';
import { type TableQueryExpose, type TableQueryProps, tableQueryExposeKeys } from '../table-query';
import { TableStatisticsColumn } from './table-stats/table-stats.api';

export interface ToolbarConfig {
  reload?: boolean;
  export?:
    | boolean
    | {
        filename: string;
      };
  fullScreen?: boolean;
  setting?: boolean;
}

export const tableEmitEvents = [
  'select-all',
  'expand-change',
  'current-change',
  'select',
  'selection-change',
  'cell-mouse-enter',
  'cell-mouse-leave',
  'cell-contextmenu',
  'cell-click',
  'cell-dblclick',
  'row-click',
  'row-contextmenu',
  'row-dblclick',
  'header-click',
  'header-contextmenu',
  'sort-change',
  'filter-change',
  'header-dragend',
];

export const tableEmitOnEvents = tableEmitEvents.map((item) => [
  item,
  'on' + upperFirst(camelCase(item)),
]);

export const tableEmitOnProps = tableEmitOnEvents.reduce(
  (obj, [, onName]) => {
    obj[onName] = {
      type: Function,
    };
    return obj;
  },
  {} as Record<string, { type: (...args: any[]) => any }>,
);

const tableExtraProps = {
  api: {
    type: null as unknown as PropType<
      ((...args: any[]) => Promise<any> | any) | boolean | null | undefined
    >,
  },
  immediate: {
    type: Boolean,
    default: true,
  },
  columns: {
    type: Array as PropType<MayBeTableColumnProps[]>,
    default: () => [],
  },
  actionColumn: {
    type: null as unknown as PropType<MayBeTableColumnProps>,
  },
  pagination: {
    type: [Object, Boolean] as PropType<boolean | PaginationProps>,
    default: true,
  },
  getExpose: {
    type: Function as PropType<(expose: TableExpose) => void>,
  },
  formProps: {
    type: Object as PropType<TableQueryProps>,
  },
  transformParams: {
    type: Function as PropType<(params: Record<string, any>) => any>,
  },
  transformResponse: {
    type: Function as PropType<(res: any) => any>,
  },
  parallelFetch: {
    type: null as unknown as PropType<
      ((...args: any[]) => Promise<any> | any) | boolean | null | undefined
    >,
  },
  toolbarConfig: {
    type: [Object, Boolean] as PropType<ToolbarConfig | boolean>,
    default: true,
  },
  keys: {
    type: Object as PropType<TableConfig['keys']>,
  },
  statsColumns: {
    type: null as unknown as PropType<
      MaybeRef<TableStatisticsColumn[] | null | undefined | boolean>
    >,
  },
  statsData: {
    type: Object as MaybeRef<any>,
  },
  summaryProperties: {
    type: Array as PropType<string[]>,
  },
  transformSummary: {
    type: Function as PropType<(sums: any[]) => any[]>,
  },
  split: {
    type: Boolean,
    default: undefined,
  },
};

export const tableProps = {
  ...omit(elTableProps, 'style'),
  ...tableExtraProps,
};

export type TableProps = Partial<ExtractPropTypes<typeof tableProps>>;

export const omittedTableProps = Object.keys(tableExtraProps) as unknown as keyof typeof tableProps;

export interface TableSlots {
  default?: (props: Record<string, never>) => any;
  append?: (props: Record<string, never>) => any;
  empty?: (props: Record<string, never>) => any;
  'toolbar-left'?: (props: Record<string, never>) => any;
  'toolbar-right'?: (props: Record<string, never>) => any;
  'before-body'?: (props: Record<string, never>) => any;
  'before-body-plain'?: (props: Record<string, never>) => any;
  'before-table'?: (props: Record<string, never>) => any;
  'before-table-plain'?: (props: Record<string, never>) => any;
}

export const elSlotsName = ['default', 'append', 'empty'] as const;

export interface TableCustomExpose {
  reload: () => Promise<void>;
  expandAll: () => void;
  collapseAll: () => void;
  getFetchParams: () => Record<string, any>;
  getFullFetchParams: () => Record<string, any>;
  setData: (data: any[]) => void;
  getData: () => any[];
  getRootEl: () => HTMLElement | null;
  getPagination: () => {
    page: number;
    pageSize: number;
  };
}

export type TableExpose = TableCustomExpose &
  TableQueryExpose & {
    clearSelection: () => void;
    getSelectionRows: () => any[];
    toggleRowSelection: (
      row: any,
      selected?: boolean,
      emitChange?: boolean,
      ignoreSelectable?: boolean,
    ) => void;
    toggleAllSelection: () => void;
    toggleRowExpansion: (row: any, expanded?: boolean) => void;
    setCurrentRow: (row: any) => void;
    clearSort: () => void;
    clearFilter: (columnKeys: any) => void;
    doLayout: () => void;
    sort: (prop: string, order: string) => void;
    scrollTo: (options: number | ScrollToOptions, yCoord?: number) => void;
    setScrollTop: (top?: number) => void;
    setScrollLeft: (left?: number) => void;
    columns: TableColumnCtx<any>[];
    updateKeyChildren: (key: string, data: any[]) => void;
  };

const elTableExposeKeys = [
  'clearSelection',
  'getSelectionRows',
  'toggleRowSelection',
  'toggleAllSelection',
  'toggleRowExpansion',
  'setCurrentRow',
  'clearSort',
  'clearFilter',
  'doLayout',
  'sort',
  'scrollTo',
  'setScrollTop',
  'setScrollLeft',
  'columns',
  'updateKeyChildren',
];

export const tableExposeKeys = [
  ...elTableExposeKeys,
  ...tableQueryExposeKeys,
  'reset',
  'submit',
  'reload',
  'expandAll',
  'collapseAll',
  'getFetchParams',
  'getFullFetchParams',
  'setData',
  'getData',
  'getRootEl',
  'getPagination',
];

export const defaultTableConfig = {
  keys: {
    /**
     * 响应数据对象中“列表数据”的 key
     */
    list: 'list',

    /**
     * 响应数据对象中“总记录数”的 key
     */
    total: 'total',

    /**
     * 请求url查询参数中“当前页数”的参数名
     */
    page: 'page',

    /**
     * 请求url查询参数中“每页条数”的参数名
     */
    pageSize: 'pageSize',

    /**
     * 请求url查询参数中“排序列”的参数名
     */
    orderBy: 'orderBy',

    /**
     * 请求url查询参数中“排序方向”的参数名
     */
    orderType: 'orderType',

    /**
     * 排序方向中“升序”的值
     */
    asc: 'asc',

    /**
     * 排序方向中“降序”的值
     */
    desc: 'desc',
  },
  pagination: {
    layout: 'prev, pager, next, sizes, jumper, total',
    currentPage: 1,
    pageSize: 10,
  },
  height: undefined,
  split: false,
};

export interface TableConfig {
  keys?: {
    list?: string;
    total?: string;
    page?: string;
    pageSize?: string;
    orderBy?: string;
    orderType?: string;
    asc?: string;
    desc?: string;
  };
  pagination?: Partial<PaginationProps>;
  height?: number | string;
  split?: boolean;
}
