import {
  type FormItemInstance,
  formItemProps as elFormItemProps,
  FormItemProps as ElFormItemProps,
} from 'element-plus';
import { type VNodeChild, type PropType } from 'vue';
import { type MapFieldTypeComponentProps, type FieldType } from '../field';
import { type ColPublicProps } from '../col';

export type FormItemPresetWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type FormItemWidth = number | FormItemPresetWidth | (string & {});

export const mapFormItemWidth = {
  xs: 104,
  sm: 216,
  md: 328,
  lg: 440,
  xl: 552,
};

export const formItemProps = {
  ...elFormItemProps,
  fieldType: {
    type: String as PropType<FieldType>,
    default: 'input' as const,
  },
  fieldProps: {
    type: Object as PropType<MapFieldTypeComponentProps[FieldType]['componentProps']>,
  },
  fieldSlots: {
    type: Object as PropType<MapFieldTypeComponentProps[FieldType]['componentSlots']>,
  },
  fieldRef: {
    type: Function as PropType<(el: any) => void>,
  },
  modelValue: {
    type: null as unknown as PropType<
      NonNullable<MapFieldTypeComponentProps[FieldType]['componentProps']>['modelValue'] | null
    >,
  },
  width: {
    type: [Number, String] as PropType<FormItemWidth>,
  },
  placeholder: {
    type: String,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  colProps: {
    type: Object as PropType<ColPublicProps>,
  },
  internalIndex: {
    type: Number,
  },
  /** 在 `co-form-query` 里所属的分组，对应 `groups[].name`，只影响排布 */
  group: {
    type: String,
  },
  tooltip: {
    type: null as unknown as PropType<VNodeChild>,
  },
  extra: {
    type: null as unknown as PropType<VNodeChild>,
  },
};

export interface FormItemProps<T extends FieldType> extends Partial<ElFormItemProps> {
  fieldType?: T;
  fieldProps?: MapFieldTypeComponentProps[T]['componentProps'];
  fieldSlots?: MapFieldTypeComponentProps[T]['componentSlots'];
  fieldRef?: (el: any) => void;
  modelValue?: NonNullable<MapFieldTypeComponentProps[T]['componentProps']>['modelValue'] | null;
  width?: FormItemWidth;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  colProps?: ColPublicProps;
  internalIndex?: number;
  group?: string;
  tooltip?: VNodeChild;
  extra?: VNodeChild;
}

export const defaultFormItemProps = {
  fieldRef: () => {},
  showMessage: true,
  inlineMessage: false,
  required: undefined,
};

export const exlucdeFieldSlotNames = ['error', 'label', 'default', 'tooltip', 'extra'] as const;

type ExlucdeFieldSlotNames = (typeof exlucdeFieldSlotNames)[number];

type OptionExlucdeFieldSlotNames = `field-${ExlucdeFieldSlotNames}`;

export type ElFormItemSlots = {
  default?: (props: Record<string, any>) => any;
  label?: (props: { label: string }) => any;
  error?: (props: { error: string }) => any;
  tooltip?: (props: Record<string, any>) => any;
  extra?: (props: Record<string, any>) => any;
} & {
  [K in OptionExlucdeFieldSlotNames]?: (...args: any[]) => any;
};

export type FormItemSlots<T extends FieldType> = NonNullable<
  MapFieldTypeComponentProps[T]['componentSlots']
> &
  ElFormItemSlots;

export const formItemPropsKeys = Object.keys(formItemProps);

export interface FormItemEmits {
  (e: 'update:modelValue', value: unknown): void;
}

const elFormItemExposeKeys = [
  'size',
  'validateMessage',
  'validateState',
  'validate',
  'resetField',
  'clearValidate',
];

export const formItemExposeKeys = [...elFormItemExposeKeys];

export interface FormItemExpose extends FormItemInstance {}
