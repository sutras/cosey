import { type PaginationProps, selectEmits, selectProps } from 'element-plus';
import { type PropType, ExtractPropTypes, SlotsType } from 'vue';
import { type TableConfig } from '../table';
import { type FormQueryProps } from '../form-query';
import { type Props } from '../../hooks';

export const remoteSelectProps = {
  ...selectProps,
  props: {
    type: Object as PropType<Props>,
  },
  optionProps: {
    type: Function as PropType<
      | Record<PropertyKey, any>
      | ((props: Record<PropertyKey, any>, index: number) => Record<PropertyKey, any>)
    >,
  },
  api: {
    type: Function as PropType<(...args: any[]) => Promise<any> | any>,
  },
  /**
   * 分页方式
   *
   * - `true` / 对象：底部页码分页，对象透传给 `ElPagination`
   * - `'scroll'`：滚动到底部自动加载下一页
   * - `false`：不分页
   */
  pagination: {
    type: [Object, Boolean, String] as PropType<boolean | 'scroll' | PaginationProps>,
    default: true,
  },
  formProps: {
    type: Object as PropType<FormQueryProps>,
  },
  transformParams: {
    type: Function as PropType<(params: Record<string, any>) => any>,
  },
  keys: {
    type: Object as PropType<TableConfig['keys']>,
  },
  immediate: {
    type: Boolean,
    default: false,
  },
  searchable: {
    type: Boolean,
    default: false,
  },
  searchParam: {
    type: [String, Function] as PropType<string | ((keyword: string) => Record<string, any>)>,
    default: 'keyword',
  },
  searchDebounce: {
    type: Number,
    default: 300,
  },
};

export type RemoteSelectProps = ExtractPropTypes<typeof remoteSelectProps>;

export interface RemoteSelectSlots {
  default: {};
  header: {};
  headerBefore: {};
  headerAfter: {};
  footer: {};
  prefix: {};
  empty: {};
  tag: {};
  loading: {};
  label: {};
  option: { option: Record<PropertyKey, any>; index: number };
}

export const remoteSelectSlots = Object as SlotsType<RemoteSelectSlots>;

export const remoteSelectEmits = {
  ...selectEmits,
  search: (keyword: string) => typeof keyword === 'string',
};

export type RemoteSelectEmits = typeof remoteSelectEmits;
