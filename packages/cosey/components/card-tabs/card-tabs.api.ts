import {
  type ExtractPropTypes,
  type PropType,
  type SlotsType,
  type VNode,
  type VNodeChild,
} from 'vue';
import { cardProps, type CardSlots } from '../card';

export type CardTabName = string | number;

/** 页签条样式：`line` 下划线、`segment` 分段块、`card` 卡片页签（贴着标题区下边框） */
export type CardTabsType = 'line' | 'segment' | 'card';

export const cardTabsProps = {
  ...cardProps,
  /** 当前激活的页签名，对应 `co-card-tab-panel` 的 `name` */
  modelValue: {
    type: [String, Number] as PropType<CardTabName>,
  },
  /** 页签条样式 */
  tabType: {
    type: String as PropType<CardTabsType>,
    default: 'line',
  },
  /** 切走前拦截，返回 `false` 则不切换 */
  beforeLeave: {
    type: Function as PropType<
      (newName: CardTabName, oldName?: CardTabName) => boolean | Promise<boolean>
    >,
  },
};

export type CardTabsProps = ExtractPropTypes<typeof cardTabsProps>;

export interface CardTabsSlots extends Omit<CardSlots, 'header'> {
  /** 页签面板，必须是 `co-card-tab-panel` 的直接父级 */
  default: {};
}

export const cardTabsSlots = Object as SlotsType<CardTabsSlots>;

const isTabName = (value: unknown) => typeof value === 'string' || typeof value === 'number';

export const cardTabsEmits = {
  'update:modelValue': (value: CardTabName) => isTabName(value),
  /** 点击页签时触发，点当前已激活的页签也会触发 */
  tabClick: (name: CardTabName) => isTabName(name),
  /** 切换完成后触发，`oldName` 是切换前的页签名 */
  tabChange: (name: CardTabName, oldName?: CardTabName) =>
    isTabName(name) && (oldName === undefined || isTabName(oldName)),
  click: (event: MouseEvent) => event instanceof MouseEvent,
  'update:collapsed': (value: boolean) => typeof value === 'boolean',
};

export type CardTabsEmits = typeof cardTabsEmits;

export interface CardTabsExpose {
  /** 当前激活的页签名 */
  activeName: CardTabName | undefined;
  /** 激活指定页签，会经过 `beforeLeave` */
  activate: (name: CardTabName) => void;
  /** 所有页签名，按书写顺序 */
  getTabNames: () => CardTabName[];
}

/** 一个面板在容器里的解析结果 */
export interface CardTabItem {
  vnode: VNode;
  index: number;
  name: CardTabName;
  label?: VNodeChild;
  labelSlot?: () => VNodeChild;
  disabled: boolean;
  lazy: boolean;
}

export interface CardTabsContext {
  /** 当前激活的页签名 */
  active: () => CardTabName | undefined;
  /** 容器的唯一标识，用于 `aria-controls` / `aria-labelledby` */
  uid: string;
}

export const cardTabsContextSymbol = Symbol('cardTabs');

export const cardTabPanelProps = {
  /** 页签名，对应 `v-model` 的值；不传则用面板序号 */
  name: {
    type: [String, Number] as PropType<CardTabName>,
  },
  /** 导航上显示的文字，也可以用 `label` 插槽 */
  label: {
    type: String,
  },
  /** 禁用该页签，仍可被 `activate` 之外的方式看到但点不动 */
  disabled: {
    type: Boolean,
  },
  /** 首次激活时才渲染内容 */
  lazy: {
    type: Boolean,
  },
  /** 由 `co-card-tabs` 注入，不要手写 */
  tabName: {
    type: [String, Number] as PropType<CardTabName>,
  },
  /** 由 `co-card-tabs` 注入，不要手写 */
  tabIndex: {
    type: Number,
  },
};

export type CardTabPanelProps = ExtractPropTypes<typeof cardTabPanelProps>;

export interface CardTabPanelSlots {
  default: {};
  /** 自定义导航上的文字，替代 `label` 属性 */
  label: {};
}

export const cardTabPanelSlots = Object as SlotsType<CardTabPanelSlots>;

/** 页签名可能是 `0` / `'0'`，按字符串比较才不会把 `v-model` 的值晾在一边 */
export function isSameTabName(a?: CardTabName, b?: CardTabName) {
  if (a === undefined || a === null || b === undefined || b === null) {
    return a === b;
  }

  return String(a) === String(b);
}
