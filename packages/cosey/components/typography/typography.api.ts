import type { ExtractPropTypes, PropType, SlotsType } from 'vue';

export type TypographyType = 'secondary' | 'success' | 'warning' | 'danger';

/** 省略号出现的位置：开头 / 中间 / 结尾 */
export type TypographyEllipsisPosition = 'head' | 'middle' | 'tail';

export interface TypographyEllipsisConfig {
  /** 最多显示几行 */
  rows?: number;
  /** 被省略时可展开 */
  expandable?: boolean;
  /** 省略号字符 */
  symbol?: string;
  /** 省略号位置，默认在结尾 */
  symbolPosition?: TypographyEllipsisPosition;
  expandText?: string;
  collapseText?: string;
}

export const typographyProps = {
  /** 文本内容，也可用默认插槽 */
  text: {
    type: String,
  },
  /** 语义色 */
  type: {
    type: String as PropType<TypographyType>,
  },
  disabled: {
    type: Boolean,
  },
  /** 标记底色 */
  mark: {
    type: Boolean,
  },
  /** 行内代码样式 */
  code: {
    type: Boolean,
  },
  underline: {
    type: Boolean,
  },
  /** 删除线 */
  delete: {
    type: Boolean,
  },
  strong: {
    type: Boolean,
  },
  italic: {
    type: Boolean,
  },
  /** 显示一键复制按钮 */
  copyable: {
    type: Boolean,
  },
  /** `true` 为单行省略，或传配置对象 */
  ellipsis: {
    type: [Boolean, Object] as PropType<boolean | TypographyEllipsisConfig>,
  },
};

export type TypographyProps = ExtractPropTypes<typeof typographyProps>;

export const typographyTitleProps = {
  /** 标题级别，1-5 */
  level: {
    type: Number,
    default: 1,
  },
};

export type TypographyTitleProps = ExtractPropTypes<
  typeof typographyTitleProps & typeof typographyProps
>;

export const typographyParagraphProps = {
  /** 根元素标签，默认 `div` */
  tag: {
    type: String,
  },
};

export type TypographyParagraphProps = ExtractPropTypes<
  typeof typographyParagraphProps & typeof typographyProps
>;

export interface TypographySlots {
  default: {};
}

export const typographySlots = Object as SlotsType<TypographySlots>;

export const typographyEmits = {
  /** 文本是否被省略发生变化 */
  'truncate-change': (truncated: boolean) => typeof truncated === 'boolean',
  /** 展开状态发生变化 */
  'expand-change': (expanded: boolean) => typeof expanded === 'boolean',
};

/** 旧 `co-long-text` 的 props，仅用于兼容层 */
export const longTextProps = {
  ...typographyProps,
  /** 兼容 `co-long-text` 的 `rows` 简写 */
  rows: {
    type: [String, Number],
  },
  expandable: {
    type: Boolean,
  },
  expandText: {
    type: String,
  },
  collapseText: {
    type: String,
  },
  tag: {
    type: String,
  },
};

export type LongTextProps = ExtractPropTypes<typeof longTextProps>;
