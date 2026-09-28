import { type ExtractPropTypes, type PropType, type SlotsType } from 'vue';
import {
  stepsProps as elStepsProps,
  stepsEmits as elStepsEmits,
  stepProps as elStepProps,
} from 'element-plus';
import { type FormContainerEntry } from '../form';
import { type UnwrapSlotsType } from '../../types/helper';

/** 从 props 定义里摘掉几个 key（返回新对象，不改动原对象） */
function omitProps<T extends object, K extends string>(props: T, keys: K[]): Omit<T, K> {
  const result = { ...props };

  keys.forEach((key) => {
    delete (result as Record<string, unknown>)[key];
  });

  return result as Omit<T, K>;
}

/** 当前步骤由 `co-form-steps` 自己的 `v-model` 管理，所以不继承 el-steps 的 `active` */
const stepsProps = omitProps(elStepsProps, ['active']);

export const formStepsProps = {
  ...stepsProps,
  /** 当前步骤序号，从 0 开始 */
  modelValue: {
    type: Number,
    default: 0,
  },
  /** 校验失败时切换到第一个包含出错字段的步骤 */
  switchToInvalid: {
    type: Boolean,
    default: true,
  },
  /** 所在弹窗/抽屉打开时回到第一步 */
  resetOnOpen: {
    type: Boolean,
    default: true,
  },
  /** 点击步骤标题可以跳转 */
  clickable: {
    type: Boolean,
    default: true,
  },
  /** 把含出错字段的步骤标记为 error */
  showStatus: {
    type: Boolean,
    default: true,
  },
  /** 内容区最小高度，避免步骤之间高低差把弹窗拽得一跳一跳 */
  bodyMinHeight: {
    type: [String, Number] as PropType<string | number>,
    default: 120,
  },
  /** 最后一步「提交」按钮的文案，默认取语言包的 `co.form.submit` */
  submitText: {
    type: String,
    default: 'co.form.submit',
  },
  /** 最后一步「提交」按钮的 props */
  submitProps: {
    type: Object as PropType<Record<string, any>>,
  },
};

export type FormStepsProps = ExtractPropTypes<typeof formStepsProps>;

export const formStepsEmits = {
  ...elStepsEmits,
};

export type FormStepsEmits = typeof formStepsEmits;

/** 底部操作区拿到的东西，也是 `actions` 插槽的参数 */
export interface FormStepsActionContext {
  /** 当前步骤序号，从 0 开始 */
  current: number;
  /** 步骤总数 */
  total: number;
  isFirst: boolean;
  isLast: boolean;
  prev: () => void;
  /** 校验当前步骤后前进；校验不通过时停在原地并返回 false */
  next: () => Promise<boolean>;
  /** 是否正在提交，最后一步的「提交」按钮据此显示 loading */
  submitting: boolean;
  /** 提交整个表单（只在最后一步有意义），等价于 `co-form` 的提交 */
  submit: () => Promise<void>;
}

export interface FormStepsSlots {
  default: {};
  /**
   * 自定义底部操作区。
   *
   * ⚠️ 在 `FormDialog` / `FormDrawer` 里**默认不渲染**操作区（按钮统一由弹窗底部提供，
   * 免得两套按钮打架）；写了这个插槽就一定会渲染，此时弹窗底部也会照常出现「下一步」。
   */
  actions: FormStepsActionContext;
}

export const formStepsSlots = {} as SlotsType<FormStepsSlots>;

export interface FormStepsExpose extends FormStepsActionContext {
  /** 切到指定步骤（越界会被夹到有效范围内） */
  goTo: (index: number) => void;
  /** 校验当前步骤，不通过时返回 false 并滚动到出错字段 */
  validateCurrent: () => Promise<boolean>;
}

/** 步骤注册到 `co-form-steps` 的条目 */
export interface FormStepEntry extends FormContainerEntry {
  /** 步骤自己的 props（title / description / icon / status），由父组件渲染标题栏用 */
  props: FormStepProps;
  /** 步骤自己的插槽，由父组件转发给 `el-step` */
  slots: UnwrapSlotsType<SlotsType<FormStepSlots>>;
}

export interface FormStepsContext {
  /** 注册步骤，返回取消注册的函数 */
  addStep: (step: FormStepEntry) => () => void;
  /** 该步骤当前是否激活。用 uid 判断：条目本身是浅代理过的，拿不到对象引用 */
  isActive: (uid: string) => boolean;
}

export const formStepsContextSymbol = Symbol('formSteps');

export const formStepProps = {
  ...elStepProps,
};

export type FormStepProps = ExtractPropTypes<typeof formStepProps>;

export interface FormStepSlots {
  default: {};
  /** 自定义步骤标题，替代 `title` 属性 */
  title: {};
  /** 自定义步骤描述，替代 `description` 属性 */
  description: {};
}

export const formStepSlots = {} as SlotsType<FormStepSlots>;
