import {
  type ButtonProps,
  formProps as elFormProps,
  FormItemProp,
  FormValidateCallback,
  FormValidationResult,
  FormItemContext,
  formEmits as elFormEmits,
} from 'element-plus';
import { ExtractPropTypes, SlotsType, type PropType } from 'vue';
import { type RowProps } from '../row';
import { type ColPublicProps } from '../col';
import { type FormItemWidth } from './form-item.api';
import { Arrayable } from '@vueuse/core';

export const formProps = {
  ...elFormProps,
  width: {
    type: [String, Number] as PropType<FormItemWidth>,
  },
  grid: {
    type: Boolean,
    default: false,
  },
  rowProps: {
    type: Object as PropType<RowProps>,
  },
  colProps: {
    type: Object as PropType<ColPublicProps>,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  submit: {
    type: Function as PropType<() => any | Promise<any>>,
  },
  reset: {
    type: Function as PropType<() => any>,
  },
  submitText: {
    type: String,
    default: 'co.form.submit',
  },
  resetText: {
    type: String,
    default: 'co.form.reset',
  },
  submitProps: {
    type: Object as PropType<ButtonProps>,
  },
  resetProps: {
    type: Object as PropType<ButtonProps>,
  },
  hideSubmit: {
    type: Boolean,
  },
  hideReset: {
    type: Boolean,
  },
  hideButtons: {
    type: Boolean,
  },
};

export type FormProps = ExtractPropTypes<typeof formProps>;

export const formPropsOmit = [
  'grid',
  'rowProps',
  'colProps',
  'width',
  'readonly',
  'submit',
  'reset',
  'submitText',
  'resetText',
  'submitProps',
  'resetProps',
  'hideSubmit',
  'hideReset',
  'hideButtons',
] as const;

export interface FormSlots {
  default: {};
  button: {
    submitting: boolean;
    submit: () => any | Promise<any>;
    reset: () => any;
  };
}

export const formSlots = Object as SlotsType<FormSlots>;

export const formEmits = {
  ...elFormEmits,
};

export type FormEmits = typeof formEmits;

export interface FormExpose {
  reset: (callback?: () => void) => void;
  submit: () => Promise<any>;
  validate: (callback?: FormValidateCallback) => FormValidationResult;
  validateField: (
    props?: Arrayable<FormItemProp>,
    callback?: FormValidateCallback,
  ) => FormValidationResult;
  resetFields: (props?: Arrayable<FormItemProp>) => void;
  clearValidate: (props?: Arrayable<FormItemProp>) => void;
  scrollToField: (prop: FormItemProp) => void;
  fields: FormItemContext[];
}

const elFormExposeKeys = [
  'validate',
  'validateField',
  'resetFields',
  'scrollToField',
  'clearValidate',
  'fields',
];

export const formExposeKeys = [...elFormExposeKeys, 'submit', 'reset'];

export interface FormContext {
  colProps?: ColPublicProps;
  grid?: boolean;
  readonly?: boolean;
  width?: FormItemWidth;
  addResetField: (reset: () => void) => void;
  removeResetField: (reset: () => void) => void;
  /**
   * 订阅「校验状态变化」，返回取消订阅的函数。
   *
   * 与只通知失败的旧契约不同，这里**通过时也会通知**（`invalidFields` 为空对象），
   * 否则页签徽标、完成度这类需要「错误消失」的能力没法做。
   */
  onValidateChange: (handler: FormValidateChangeHandler) => () => void;
  /** 订阅「弹窗/抽屉打开」，返回取消订阅的函数 */
  onOpen: (handler: () => void) => () => void;
  /** 当前全部出错字段的快照，key 是 form-item 的 propString */
  getInvalidFields: () => FormInvalidFields;
  /** 当前所有表单项，即 el-form 的 fields，用于判断字段归属于哪个页签/区块 */
  getFields: () => FormItemContext[];
  /**
   * 校验指定字段，不传则校验整个表单，返回是否通过。
   * `reason` 决定通知类型，默认 `validate`（会让容器切到出错位置并滚动）
   */
  validateFields: (
    props?: Arrayable<FormItemProp>,
    reason?: FormValidateChangeReason,
  ) => Promise<boolean>;
  /** 滚动到第一个可见的出错字段并短暂高亮 */
  scrollToInvalid: (invalidFields?: FormInvalidFields) => void;
  /** 表单项自身的校验状态变化时上报，由 co-form-item 调用 */
  reportFieldChange: () => void;
  /** 提交表单（带防抖与 `submitting` 状态），由分步容器在最后一步调用 */
  submit: () => Promise<void>;
  /** 是否正在提交，分步容器的「提交」按钮据此显示 loading */
  submitting: boolean;
  /** 分步容器上报「我来接管提交按钮」，`co-form` 据此收起自己的「提交 + 重置」行 */
  setHasSteps: (hasSteps: boolean) => void;
  /** 是否有分步容器接管了提交按钮（只读，由 `co-form` 消费） */
  hasSteps: boolean;
}

/** el-form 校验失败时给出的出错字段，key 是 form-item 的 propString */
export type FormInvalidFields = Record<string, unknown>;

/** 触发校验状态变化通知的场景 */
export type FormValidateChangeReason =
  /** 整体校验（submit / validate / validateFields）：需要切到出错容器并滚动定位 */
  | 'validate'
  /** 局部校验（validateField）：只同步状态，不打断用户当前操作 */
  | 'validate-field'
  /** 字段自身校验状态变化（blur / change 触发的实时校验） */
  | 'field'
  /** clearValidate / resetFields 之后 */
  | 'reset';

export type FormValidateChangeHandler = (
  invalidFields: FormInvalidFields,
  reason: FormValidateChangeReason,
) => void;

export const formContextSymbol = Symbol('form');

export interface FormBubbleData {
  readonly: boolean;
  submitting: boolean;
  submit: (throwError?: boolean, shouldReset?: boolean) => any | Promise<any>;
  reset: () => any;
  resetFields: () => any;
  clearValidate: () => any;
  /** 弹窗/抽屉打开时触发，用于让表单内部组件（如 co-form-tabs）复位自己的状态 */
  notifyOpen: () => void;
}

/**
 * 分步表单（`co-form-steps`）注册给弹窗 / 抽屉的控制接口。
 *
 * 有了它，弹窗底部那个「确定」按钮在前几步会变成「下一步」，并额外渲染一个「上一步」——
 * 分步的翻页按钮就不会和弹窗自己的按钮挤在一起了。
 */
export interface FormBubbleSteps {
  /** 当前步骤序号，从 0 开始 */
  current: number;
  /** 步骤总数 */
  total: number;
  isFirst: boolean;
  isLast: boolean;
  prev: () => void;
  /** 校验当前步骤后前进；校验不通过时停在原地并返回 false */
  next: () => Promise<boolean>;
}

export interface FormBubbleContext {
  setFormBubbleData: (data: FormBubbleData) => void;
  confirm: () => Promise<void>;
  /**
   * 分步表单的注册入口。传的是**取值函数**而不是快照，这样弹窗按钮每次渲染都能拿到最新状态；
   * 返回的函数用于取消注册。
   */
  registerSteps: (getSteps: () => FormBubbleSteps) => () => void;
}

export const formBubbleContextSymbol = Symbol('formBubble');
