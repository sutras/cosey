import { type PropType, type ExtractPropTypes, MaybeRef } from 'vue';
import { camelCase, omit, upperFirst } from 'lodash-es';
import { TableColumnCtx, type PaginationProps } from 'element-plus';
import elTableProps from 'element-plus/es/components/table/src/table/defaults.mjs';
import { type MayBeTableColumnProps } from './table-column/table-column.api';
import { type FormQueryExpose, type FormQueryProps, formQueryExposeKeys } from '../form-query';
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
    type: Object as PropType<FormQueryProps>,
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
    default: undefined,
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
  /**
   * 表格标识。设置后会把列顺序/显示状态持久化到本地存储，刷新后恢复。
   *
   * 注意不能叫 `key`：`key` 是 Vue 的内置 attribute，会被编译到 vnode 上，不会作为 prop 传入。
   */
  tableKey: {
    type: String,
  },
  /**
   * 批量操作条：选中行后显示，内容由 `#batch` 插槽提供。
   *
   * 传 `true` 使用默认文案；传对象可自定义文案。
   */
  batch: {
    type: [Boolean, Object] as PropType<boolean | { text?: string }>,
    default: false,
  },
  /** 行拖拽排序，默认关闭；开启后 `row-move` 事件给出新的顺序 */
  rowDraggable: {
    type: Boolean,
    default: false,
  },
};

/** 自定义事件（非 el-table 原生事件） */
export const tableCustomEmitEvents = ['row-move', 'cell-change'];

export const tableProps = {
  ...omit(elTableProps, 'style'),
  ...tableExtraProps,
};

export type TableProps = Partial<ExtractPropTypes<typeof tableProps>>;

export const omittedTableProps = Object.keys(tableExtraProps) as unknown as keyof typeof tableProps;

export interface TableSlots {
  default?: (props: Record<string, never>) => any;
  /** 批量操作条内容，仅在选中行后渲染 */
  batch?: (props: { count: number; rows: any[]; clear: () => void }) => any;
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
  /** 清空选中并隐藏批量条 */
  clearSelection: () => void;
  /** 当前选中的行 */
  getSelectionRows: () => any[];
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
  FormQueryExpose & {
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
  ...formQueryExposeKeys,
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
  toolbarConfig: true as ToolbarConfig | boolean,
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
  /** 工具栏按钮的全局默认值，可被表格上的 `toolbar-config` 覆盖 */
  toolbarConfig?: ToolbarConfig | boolean;
  height?: number | string;
  split?: boolean;
}
