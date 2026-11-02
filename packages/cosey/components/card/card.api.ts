import { type CSSProperties, type ExtractPropTypes, type PropType, type SlotsType } from 'vue';

export type CardSize = 'medium' | 'small';

export type CardVariant = 'outlined' | 'borderless';

export type CardCollapsible = boolean | 'icon' | 'header';

/** 与 Vue 的 `class` 绑定一致：字符串 / 数组 / 对象 */
export type CardClassName = string | unknown[] | Record<string, unknown>;

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
  /** 卡片页脚，也可以用 `footer` 插槽 */
  footer: {
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
  /** 标题区的额外类名 */
  headerClass: {
    type: [String, Array, Object] as PropType<CardClassName>,
  },
  /** 标题区的额外样式 */
  headerStyle: {
    type: Object as PropType<CSSProperties>,
  },
  /** 内容区的额外类名 */
  bodyClass: {
    type: [String, Array, Object] as PropType<CardClassName>,
  },
  /** 内容区的额外样式（`height` / `flex` / `overflow` 会被折叠动画临时接管） */
  bodyStyle: {
    type: Object as PropType<CSSProperties>,
  },
  /** 页脚的额外类名 */
  footerClass: {
    type: [String, Array, Object] as PropType<CardClassName>,
  },
  /** 页脚的额外样式 */
  footerStyle: {
    type: Object as PropType<CSSProperties>,
  },
};

export type CardProps = ExtractPropTypes<typeof cardProps>;

export interface CardSlots {
  default: {};
  /**
   * 整块替换标题区的内容（标题、副标题、操作区都不再渲染），
   * 外层的内边距、分隔线与折叠按钮仍由卡片负责。
   */
  header: {};
  title: {};
  subTitle: {};
  /** 右上角的操作区 */
  extra: {};
  /** 页脚，优先于 `footer` 属性 */
  footer: {};
}

export const cardSlots = Object as SlotsType<CardSlots>;

export const cardEmits = {
  click: (event: MouseEvent) => event instanceof MouseEvent,
  'update:collapsed': (value: boolean) => typeof value === 'boolean',
};

export type CardEmits = typeof cardEmits;
