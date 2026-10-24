import type { CSSProperties, ExtractPropTypes, PropType, SlotsType, VNodeChild } from 'vue';

export type DescriptionsSize = 'large' | 'medium' | 'small';

export type DescriptionsLayout = 'horizontal' | 'vertical';

export type DescriptionsBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

/** 列数：数字，或按断点声明（按容器宽度命中，没命中的断点向更小的断点回落） */
export type DescriptionsColumn = number | Partial<Record<DescriptionsBreakpoint, number>>;

export interface DescriptionsItemData {
  key?: string | number;
  /** 标签 */
  label?: VNodeChild;
  /** 标签右侧的提示说明 */
  tooltip?: string;
  /** 内容 */
  content?: VNodeChild;
  /** 内容字段别名，`content` 优先 */
  children?: VNodeChild;
  /** 占用的列数 */
  span?: number;
  labelStyle?: CSSProperties;
  contentStyle?: CSSProperties;
  class?: string;
  style?: CSSProperties;
}

export const descriptionsProps = {
  /** 标题，也可用 `title` 插槽 */
  title: {
    type: String,
  },
  /** 标题右侧的提示说明 */
  tooltip: {
    type: String,
  },
  /** 标题右侧的附加内容，也可用 `extra` 插槽 */
  extra: {
    type: String,
  },
  /** 列数，可按断点声明 */
  column: {
    type: [Number, Object] as PropType<DescriptionsColumn>,
  },
  /** 显示边框 */
  bordered: {
    type: Boolean,
  },
  /** 排列方向：横向标签在值左侧，纵向标签在值上方 */
  layout: {
    type: String as PropType<DescriptionsLayout>,
    default: 'horizontal',
  },
  /** 尺寸 */
  size: {
    type: String as PropType<DescriptionsSize>,
    default: 'medium',
  },
  /** 标签后追加冒号（边框模式不显示冒号） */
  colon: {
    type: Boolean,
    default: true,
  },
  /** 标签对齐方式 */
  labelAlign: {
    type: String as PropType<'left' | 'center' | 'right'>,
    default: 'left',
  },
  /** 标签列样式 */
  labelStyle: {
    type: Object as PropType<CSSProperties>,
  },
  /** 内容列样式 */
  contentStyle: {
    type: Object as PropType<CSSProperties>,
  },
  /** 以数据方式声明子项，与默认插槽二选一 */
  items: {
    type: Array as PropType<DescriptionsItemData[]>,
  },
};

export type DescriptionsProps = ExtractPropTypes<typeof descriptionsProps>;

export interface DescriptionsSlots {
  default: {};
  title: {};
  extra: {};
}

export const descriptionsSlots = Object as SlotsType<DescriptionsSlots>;

export const descriptionsEmits = {};

export type DescriptionsEmits = typeof descriptionsEmits;

export const descriptionsItemProps = {
  /** 标签 */
  label: {
    type: [String, Number, Object, Array] as PropType<VNodeChild>,
  },
  /** 标签右侧的提示说明 */
  tooltip: {
    type: String,
  },
  /** 占用的列数 */
  span: {
    type: Number,
    default: 1,
  },
  labelStyle: {
    type: Object as PropType<CSSProperties>,
  },
  contentStyle: {
    type: Object as PropType<CSSProperties>,
  },
};

export type DescriptionsItemProps = ExtractPropTypes<typeof descriptionsItemProps>;

export interface DescriptionsItemSlots {
  default: {};
}

export const descriptionsItemSlots = Object as SlotsType<DescriptionsItemSlots>;

export const descriptionsItemEmits = {};

export type DescriptionsItemEmits = typeof descriptionsItemEmits;
