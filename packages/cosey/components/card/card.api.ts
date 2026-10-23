import { type ExtractPropTypes, type PropType, type SlotsType } from 'vue';

export type CardSize = 'medium' | 'small';

export type CardVariant = 'outlined' | 'borderless';

export type CardCollapsible = boolean | 'icon' | 'header';

export const cardProps = {
  /** 尺寸 */
  size: {
    type: String as PropType<CardSize>,
    default: 'medium',
  },
  /** 形态：`outlined` 带边框，`borderless` 无边框 */
  variant: {
    type: String as PropType<CardVariant>,
    default: 'outlined',
  },
  /** 鼠标移入时浮起 */
  hoverable: {
    type: Boolean,
  },
  /** 卡片标题 */
  title: {
    type: String,
  },
  /** 卡片副标题，显示在标题下方 */
  subTitle: {
    type: String,
  },
  /** 卡片类型，`inner` 为内嵌卡片 */
  type: {
    type: String as PropType<'inner'>,
  },
  /**
   * 折叠方式：
   * - `false`：不可折叠
   * - `'icon'` / `true`：右侧图标切换
   * - `'header'`：点击整个标题区切换
   */
  collapsible: {
    type: [Boolean, String] as PropType<CardCollapsible>,
    default: false,
  },
  /** 是否折叠，配合 `v-model:collapsed` */
  collapsed: {
    type: Boolean,
    default: false,
  },
  /** 标题右侧的提示说明 */
  tooltip: {
    type: String,
  },
  /** 常驻阴影 */
  boxShadow: {
    type: Boolean,
  },
  /** 内容区固定高度，超出后内部滚动（含内边距） */
  height: {
    type: [String, Number] as PropType<string | number>,
  },
  /** 内容区最大高度，超出后内部滚动（含内边距） */
  maxHeight: {
    type: [String, Number] as PropType<string | number>,
  },
};

export type CardProps = ExtractPropTypes<typeof cardProps>;

export interface CardSlots {
  default: {};
  title: {};
  subTitle: {};
  /** 右上角的操作区 */
  extra: {};
}

export const cardSlots = Object as SlotsType<CardSlots>;

export const cardEmits = {
  click: (event: MouseEvent) => event instanceof MouseEvent,
  'update:collapsed': (value: boolean) => typeof value === 'boolean',
};

export type CardEmits = typeof cardEmits;
