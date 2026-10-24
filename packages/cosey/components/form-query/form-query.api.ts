import { type SlotsType, type ExtractPublicPropTypes, type PropType, type VNodeChild } from 'vue';
import { type FormItemProps, type FormSlots, type FormExpose, formProps, formEmits } from '../form';
import { type FieldType } from '../field';
import { type ColPublicProps } from '../col';
import { isBoolean } from '../../utils';

export const defaultMapSizeColNumber = {
  xs: 24,
  sm: 12,
  md: 8,
  lg: 6,
  xl: 6,
  xxl: 6,
};

/**
 * 查询项的声明式写法：一份 `FormItem` 的属性 + 自定义渲染。
 * 也可以用 default 插槽手写 `co-form-item`，两种写法可以混用。
 */
export type FormQueryScheme = FormItemProps<FieldType> & {
  render?: (params: { model: Record<string, any> }) => VNodeChild;
  slots?: Record<string, unknown>;
};

/** 仅为了类型推断，原样返回 */
export function createFormQueryScheme<T extends FieldType>(props: FormItemProps<T>) {
  return props;
}

/** 查询表单的分组：字段上标 `group`，这里只负责组名、标题与顺序 */
export interface FormQueryGroup {
  /** 与字段 `group` 对应 */
  name: string;
  /** 组标题，不传则只分段、不渲染标题 */
  label?: string;
}

/** 组名位置 */
export type FormQueryGroupLayout = 'top' | 'left';

export const formQueryProps = {
  ...formProps,
  grid: {
    type: Boolean,
    default: true,
  },
  colProps: {
    type: Object as PropType<ColPublicProps>,
    default: () => defaultMapSizeColNumber,
  },
  minFields: {
    type: Number,
    default: -1,
  },
  collapsed: {
    type: Boolean,
    default: true,
  },
  resetValues: {
    type: Function as PropType<() => Record<string, any>>,
  },
  /**
   * 收起状态下的字段仍在 el-form 里参与校验（只是 `display:none`），
   * 校验失败时自动展开，否则用户只会看到「点了查询没反应」
   */
  switchToInvalid: {
    type: Boolean,
    default: true,
  },
  /**
   * 声明式字段。和 default 插槽里的 `co-form-item` 等价，只是不用手写 v-model：
   * 值统一落到 `model` 上，各项的 `modelValue` 即该字段的初值。
   *
   * 不传 `model` 时组件自己维护一个内部模型（用 `getModel` / `getFieldsValue` 取）。
   */
  schemes: {
    type: Array as PropType<FormQueryScheme[]>,
    default: () => [],
  },
  /** 输入框里按 Enter 直接提交；普通表单不需要时显式传 `false` */
  submitOnEnter: {
    type: Boolean,
    default: true,
  },
  /**
   * 分组：按声明顺序分段，组头独占一行。字段用 `group` 指定所属分组，
   * 没有标记或标记了未声明分组名的字段排在最后一段（不渲染组头）。
   *
   * 只在栅格模式下生效；`grid=false` 时忽略。
   */
  groups: {
    type: Array as PropType<FormQueryGroup[]>,
    default: () => [],
  },
  /**
   * 组名位置：`top` 独占一行；`left` 在左侧占一列、字段排在右边。
   * `left` 只在容器够宽（≥992px）时生效，窄屏自动回落成 `top`。
   */
  groupLayout: {
    type: String as PropType<FormQueryGroupLayout>,
    default: 'top',
  },
};

export type FormQueryProps = ExtractPublicPropTypes<typeof formQueryProps>;

export interface FormQuerySlots extends FormSlots {}

export const formQuerySlots = Object as SlotsType<FormQuerySlots>;

export const formQueryEmits = {
  ...formEmits,
  'update:collapsed': (val: boolean) => isBoolean(val),
};

export type FormQueryEmits = typeof formQueryEmits;

export interface FormQueryExpose extends Omit<FormExpose, 'reset'> {
  /** 传回调时与 `FormExpose['reset']` 一致；传对象时先重置、再把对象写回模型 */
  reset: (valuesOrCallback?: Record<PropertyKey, any> | (() => void)) => void;
  /** 模型快照（深拷贝），可直接当请求参数 */
  getFieldsValue: () => Record<string, any>;
  setFieldsValue: (values: Record<PropertyKey, any>) => void;
  /** 原始模型（响应式对象，改它不会触发查询，配合 `submit()` 使用） */
  getModel: () => Record<string, any>;
}

/**
 * 与 form 的 `formExposeKeys` 保持一致，外加由 form-query 自己补上的方法。
 * 这里不直接展开 `formExposeKeys`：form-query 处在 form 的循环依赖里，
 * 模块初始化时那个绑定可能还没就绪。
 */
export const formQueryExposeKeys = [
  'validate',
  'validateField',
  'resetFields',
  'scrollToField',
  'clearValidate',
  'fields',
  'submit',
  'reset',
  'getFieldsValue',
  'setFieldsValue',
  'getModel',
];

/** 供 `co-form-query` 之外的容器（如 `co-form-tabs`）识别的内部上下文 */
export interface FormQueryContext {
  shouldHide: (index: number) => boolean;
}

export const formQueryContextSymbol = Symbol('formQueryContext');
