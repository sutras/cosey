import {
  type CheckboxGroupValueType,
  type CheckboxGroupInstance,
  type CheckboxGroupProps,
  type CheckboxValueType,
  type CheckboxProps,
} from 'element-plus';
import { type FieldComponentCommonProps } from '../common';
import { Props } from '../../../../hooks';

export type FieldCheckboxGroupOption = Partial<CheckboxProps> | string | number;

type CheckboxPropsObjectOption = Partial<CheckboxProps> & { [k: string]: any };

export interface FieldCheckboxGroupProps extends FieldComponentCommonProps {
  // Omit 'options'：element-plus 自己的 options 只支持对象，与本组件的 options 交叉后会
  // 变成 `CheckboxOption[] & FieldCheckboxGroupOption[]`，字符串选项（本项目支持）就传不进来
  componentProps?: Partial<Omit<CheckboxGroupProps, 'options'>> & {
    'onUpdate:modelValue'?: (val: CheckboxGroupValueType) => void;
    onChange?: (val: CheckboxValueType[]) => void;
    [key: PropertyKey]: any;
  } & {
    options?: FieldCheckboxGroupOption[];
    props?: Props;
    type?: 'button' | 'checkbox';
    checkboxWidth?: string | number;
    indeterminate?: boolean;
    maxHeight?: string | number;
    checkboxProps?:
      | CheckboxPropsObjectOption
      | ((props: CheckboxPropsObjectOption, index: number) => CheckboxPropsObjectOption);
  };
  componentSlots?: Partial<FieldCheckboxGroupSlots>;
}

export const fieldCheckboxGroupOmitKeys = [
  'options',
  'props',
  'type',
  'checkboxWidth',
  'maxHeight',
  'checkboxProps',
] as const;

export interface FieldCheckboxGroupSlots {
  default?: (props: Record<string, any>) => any;
  checkbox?: (props: { option: Record<PropertyKey, any>; index: number }) => any;
}

export interface FieldCheckboxGroupEmits {
  (e: 'update:modelValue', val: CheckboxGroupValueType): void;
  (e: 'change', val: CheckboxValueType[]): void;
}

export type FieldCheckboxGroupExpose = CheckboxGroupInstance;
