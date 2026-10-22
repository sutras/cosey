import { type PropType, ExtractPropTypes, SlotsType } from 'vue';
import { type DialogProps, type DrawerProps, type PaginationProps } from 'element-plus';
import { type TableConfig, type TableProps } from '../table';
import { type Props } from '../../hooks';

export const tableSelectProps = {
  modelValue: {
    type: null as unknown as PropType<any>,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  api: {
    type: Function as PropType<(...args: any[]) => Promise<any> | any>,
  },
  columns: {
    type: Array as PropType<TableProps['columns']>,
    default: () => [],
  },
  /** 透传给 `co-table` 的其他属性；`columns` / `api` 以同级属性为准 */
  tableProps: {
    type: Object as PropType<Partial<TableProps>>,
  },
  formProps: {
    type: Object as PropType<TableProps['formProps']>,
  },
  transformParams: {
    type: Function as PropType<(params: Record<string, any>) => any>,
  },
  transformResponse: {
    type: Function as PropType<(res: any) => any>,
  },
  keys: {
    type: Object as PropType<TableConfig['keys']>,
  },
  pagination: {
    type: [Object, Boolean] as PropType<boolean | PaginationProps>,
    default: true,
  },
  /** 字段映射，用于取每一行的文本与值 */
  props: {
    type: Object as PropType<Props>,
  },
  placeholder: {
    type: String,
  },
  /** 输入框尺寸，不传时跟随所在的 `co-form-item` */
  size: {
    type: String as PropType<'small' | 'default' | 'large'>,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  /** 多选时输入框里最多显示几个标签，其余折叠为 `+N` */
  maxTagCount: {
    type: Number,
    default: 2,
  },
  title: {
    type: String,
  },
  width: {
    type: [String, Number],
    default: 900,
  },
  dialogProps: {
    type: Object as PropType<Partial<DialogProps>>,
  },
  /** 用抽屉代替弹窗 */
  drawer: {
    type: Boolean,
    default: false,
  },
  drawerProps: {
    type: Object as PropType<Partial<DrawerProps>>,
  },
  /**
   * 回显：`modelValue` 里只有值时，用它查出对应的行，否则标签会显示成原始值。
   * 参数是尚未拿到行的值列表，返回完整的行。
   */
  fetchSelected: {
    type: Function as PropType<(values: any[]) => Promise<any[]> | any[]>,
  },
  /** 表格行唯一标识字段，用于跨页保留选中态 */
  rowKey: {
    type: [String, Function] as PropType<string | ((row: any) => any)>,
  },
};

export type TableSelectProps = ExtractPropTypes<typeof tableSelectProps>;

export interface TableSelectSlots {
  /** 自定义标签内容 */
  tag: { row: any; index: number };
  /** 自定义单选时的文本内容 */
  label: { row: any };
  /** 批量操作条右侧的操作，紧挨着默认的「清空」 */
  batch: { rows: any[]; count: number; clear: () => void };
}

export const tableSelectSlots = Object as SlotsType<TableSelectSlots>;

export const tableSelectEmits = {
  'update:modelValue': (value: any) => value || true,
  change: (value: any, rows: any[]) => Array.isArray(rows) || !!value,
  confirm: (value: any, rows: any[]) => Array.isArray(rows) || !!value,
  cancel: () => true,
  clear: () => true,
  'visible-change': (visible: boolean) => typeof visible === 'boolean',
};

export type TableSelectEmits = typeof tableSelectEmits;
