import { type ExtractPropTypes, type SlotsType } from 'vue';
import {
  tabsProps as elTabsProps,
  tabsEmits as elTabsEmits,
  tabPaneProps as elTabPaneProps,
} from 'element-plus';
import { type FormContainerEntry } from '../form';

export type FormTabName = string | number;

export const formTabsProps = {
  ...elTabsProps,
  /** 校验失败时切到第一个包含出错字段的页签 */
  switchToInvalid: {
    type: Boolean,
    default: true,
  },
  /** 所在弹窗/抽屉打开时回到第一个页签 */
  resetOnOpen: {
    type: Boolean,
    default: true,
  },
  /** 在页签标题上显示该页签内的错误数量 */
  showBadge: {
    type: Boolean,
    default: true,
  },
};

export type FormTabsProps = ExtractPropTypes<typeof formTabsProps>;

export const formTabsEmits = {
  ...elTabsEmits,
};

export type FormTabsEmits = typeof formTabsEmits;

export interface FormTabsSlots {
  default: {};
}

export const formTabsSlots = Object as SlotsType<FormTabsSlots>;

export interface FormTabsExpose {
  /** 当前激活的页签 */
  activeName: FormTabName | undefined;
  /** 激活指定页签 */
  activate: (name?: FormTabName) => void;
  /** 校验当前页签；不通过时会切到出错位置并滚动过去 */
  validateCurrent: () => Promise<boolean>;
  /** 所有页签名，按显示顺序 */
  getTabNames: () => FormTabName[];
}

/**
 * 页签注册到 `co-form-tabs` 的条目。
 *
 * 之所以要拿到页签的 DOM，是因为判断「某个表单项属于哪个页签」最可靠的方式
 * 就是看它渲染在哪个页签子树里 —— 不用改 `co-form-item`，动态增删的字段也天然正确。
 */
export interface FormTabPanelEntry extends FormContainerEntry {
  /** 页签的 name，未显式传入时由 `co-form-tab-panel` 自动生成 */
  id: () => FormTabName;
}

export interface FormTabPanelState {
  /** 该页签内当前的出错字段数量 */
  errorCount: number;
}

export interface FormTabsContext {
  /** 注册页签，返回取消注册的函数 */
  addPanel: (panel: FormTabPanelEntry) => () => void;
  /** 取页签状态，用于错误徽标 */
  getPanelState: (name: FormTabName) => FormTabPanelState;
}

export const formTabsContextSymbol = Symbol('formTabs');

export const formTabPanelProps = {
  ...elTabPaneProps,
};

export type FormTabPanelProps = ExtractPropTypes<typeof formTabPanelProps>;

export interface FormTabPanelSlots {
  default: {};
  /** 自定义页签标题，替代 `label` 属性 */
  label: {};
}

export const formTabPanelSlots = Object as SlotsType<FormTabPanelSlots>;
