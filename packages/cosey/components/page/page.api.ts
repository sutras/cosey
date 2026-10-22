import { type ExtractPropTypes, type PropType, type SlotsType } from 'vue';
import { type RouteLocationRaw } from 'vue-router';

export const pageProps = {
  /** 页面标题 */
  title: {
    type: String,
  },
  /** 标题下方的描述 */
  description: {
    type: String,
  },
  /**
   * 返回按钮：
   * - `true`：返回上一页
   * - 字符串：跳转到指定路由
   * - 函数：自定义行为
   */
  back: {
    type: [Boolean, String, Function] as PropType<boolean | RouteLocationRaw | (() => any)>,
    default: false,
  },
  /** 标题区下边框，默认显示 */
  border: {
    type: Boolean,
    default: true,
  },
  /** 去掉内边距，适合嵌在 `co-card` / `co-panel` 内部 */
  ghost: {
    type: Boolean,
  },
};

export type PageProps = ExtractPropTypes<typeof pageProps>;

export interface PageSlots {
  default: {};
  title: {};
  description: {};
  /** 标题右侧的操作区（按钮组） */
  actions: {};
  /** 标题区最右侧的附加内容 */
  extra: {};
  footer: {};
}

export const pageSlots = Object as SlotsType<PageSlots>;

export const pageEmits = {
  back: () => true,
};
