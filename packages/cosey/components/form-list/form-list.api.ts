import { type PropType, type SlotsType } from 'vue';
import { type TableProps } from 'element-plus';
import {
  type ElFormItemSlots,
  type FormItemExpose,
  type FormItemProps,
  type FormItemWidth,
  defaultFormItemProps,
  formItemExposeKeys,
  formItemProps,
} from '../form';

export type FormListRow = Record<string, any>;

/**
 * 渲染形态。
 *
 * - `default`：表单项竖排，列头由 `columns` 或插槽内的 `FormItem` 推导，窄屏自动塌成单列。
 * - `table`：用 `el-table` 承载每一行，列头、宽度、对齐交给表格，适合行数多或需要横向对照的场景。
 */
export type FormListLayout = 'default' | 'table';

export interface FormListColumn {
  label?: string;
  width?: FormItemWidth;
  required?: boolean;
  /**
   * 列对应的字段名，仅 `table` 布局使用。
   *
   * 不传时从对应表单项的 `prop` 末段推导，一般不需要自己写。
   * 需要列排序/自定义渲染时再显式指定。
   */
  prop?: string;
  /** 单元格对齐，仅 `table` 布局使用 */
  align?: 'left' | 'center' | 'right';
  /** 列头对齐，仅 `table` 布局使用，缺省跟随 `align` */
  headerAlign?: 'left' | 'center' | 'right';
}

export const formListProps = {
  ...formItemProps,
  defaultValue: {
    type: Object,
  },
  min: {
    type: Number,
  },
  max: {
    type: Number,
  },
  modelValue: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  addText: {
    type: String,
    default: 'co.common.add',
  },
  columns: {
    type: Array as PropType<FormListColumn[]>,
  },
  draggable: {
    type: Boolean,
  },
  layout: {
    type: String as PropType<FormListLayout>,
    default: 'default',
  },
  tableProps: {
    type: Object as PropType<Partial<TableProps<any>>>,
  },
};

export const defaultFormListProps = {
  ...defaultFormItemProps,
  modelValue: () => [],
  addText: 'co.common.add',
  layout: 'default' as FormListLayout,
};

export interface FormListProps<T = FormListRow> extends Omit<FormItemProps<'input'>, 'modelValue'> {
  defaultValue?: T;
  modelValue?: T[];
  min?: number;
  max?: number;
  addText?: string;
  columns?: FormListColumn[];
  draggable?: boolean;
  layout?: FormListLayout;
  /** 透传给内部 `el-table` 的属性，`data` / `row-key` 由组件自己管理 */
  tableProps?: Partial<TableProps<any>>;
}

export interface FormListSlots<T = FormListRow> extends Omit<ElFormItemSlots, 'default'> {
  default?: (props: {
    row: T;
    index: number;
    getProp: (...args: (string | number)[]) => string[];
  }) => any;
  custom?: (
    props: {
      list: T[];
      getProp: (...args: (string | number)[]) => string[];
      getKey: (row: T) => string;
    } & FormListAction<T>,
  ) => any;
}

export const formListSlots = Object as SlotsType<FormListSlots>;

export const formListEmits = {
  'update:modelValue': (value: any[]) => value || true,
};

export interface FormListEmits<T = FormListRow> {
  (e: 'update:modelValue', value: T[]): void;
}

export interface FormListAction<T = FormListRow> {
  add: (row?: T, index?: number) => void;
  remove: (index: number) => void;
  move: (fromIndex: number, toIndex: number) => void;
}

export interface FormListExpose<T = FormListRow> extends FormItemExpose, FormListAction<T> {}

export const formListExposeKeys = [...formItemExposeKeys, 'add', 'remove', 'move'];

export interface FormListGuards<T = FormListRow> {
  beforeAdd: (defaultValue: T, index: number, count: number) => Promise<any> | any;
  beforeRemove: (index: number, count: number) => Promise<boolean> | boolean;
}

export interface FormListContext {}
