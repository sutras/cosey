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
  pagination: {
    type: [Object, Boolean] as PropType<boolean | PaginationProps>,
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
};

export type RemoteSelectEmits = typeof remoteSelectEmits;
