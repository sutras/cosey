import { type VNode, type ExtractPropTypes, type PropType } from 'vue';
import { type TableColumnCtx } from 'element-plus';
import elTableColumnProps from 'element-plus/es/components/table/src/table-column/defaults.mjs';
import { type TableActionProps } from '../../table-action/table-action.api';
import { type RendererType } from './renderer';

export type TableColumnPropsSlots =
  | string
  | ((props: { row: any; column: any; $index: number }) => any)
  | {
      default?: string | ((props: { row: any; column: any; $index: number }) => any);
      header?: string | ((props: { column: any; $index: number }) => any);
      filterIcon?: string | ((props: { filterOpened: boolean }) => any);
    };

export type TableColumnActions =
  | TableActionProps['actions']
  | ((row: any, $index: number) => TableActionProps['actions']);

// 能用于递归
export type TableColumnProps<T = any> = Partial<
  Omit<ExtractPropTypes<typeof elTableColumnProps>, 'align' | 'tooltipFormatter'>
> & {
  slots?: TableColumnPropsSlots;
  renderer?: RendererType;
  hidden?: boolean;
  align?: 'left' | 'center' | 'right';
  columns?: TableColumnProps<T>[];
  internalSlot?: {
    [prop: string]: any;
  };
  tooltip?: string;
  format?: (cellValue: any, row: any, column: TableColumnCtx<any>, index: number) => VNode | string;
  /** 操作按钮，见 `TableColumnActions`；与 `slots` 同时存在时以它为准 */
  actions?: TableColumnActions;
  /** 操作按钮之间的分割线，仅在 `actions` 下生效；不传时走全局 `config.tableAction.divider` */
  divider?: boolean;
};

export type MayBeTableColumnProps = TableColumnProps | null | undefined | boolean;

export const tableColumnProps = {
  ...elTableColumnProps,
  slots: {
    type: [String, Object, Function] as PropType<TableColumnProps['slots']>,
  },
  renderer: {
    type: [String, Object] as PropType<TableColumnProps['renderer']>,
    default: 'text',
  },
  hidden: {
    type: Boolean,
  },
  align: {
    type: String as PropType<TableColumnProps['align']>,
    default: 'left',
  },
  columns: {
    type: Array as PropType<TableColumnProps[]>,
  },
  internalSlot: {
    type: Object as PropType<TableColumnProps['internalSlot']>,
  },
  tooltip: {
    type: String,
  },
  format: {
    type: Function,
  },
  actions: {
    type: [Array, Function] as PropType<TableColumnProps['actions']>,
  },
  divider: {
    type: Boolean,
    // 必须显式给 `undefined`：Boolean 的默认值是 `false`，
    // 会把全局配置里的 `tableAction.divider` 一起盖掉
    default: undefined,
  },
};

export interface TableColumnSlots {
  default?: (props: { row: any; column: any; $index: number }) => any;
  header?: (props: { column: any; $index: number }) => any;
  'filter-icon'?: (props: { filterOpened: boolean }) => any;
}
