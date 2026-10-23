import {
  computed,
  inject,
  MaybeRefOrGetter,
  provide,
  reactive,
  ref,
  toValue,
  type ExtractPropTypes,
  type InjectionKey,
  type PropType,
  type SlotsType,
} from 'vue';
import { type RouteLocationRaw } from 'vue-router';
import { useWindowResize } from '../../hooks';

export const containerProps = {
  /** 高度设为一屏：视口高度减去头部导航高度 */
  fullPage: {
    type: Boolean,
  },
  /** 高度撑满父容器，父级需有确定高度 */
  fill: {
    type: Boolean,
  },
  /**
   * 内边距：
   * - `true`：默认间距
   * - `false` / `0`：去掉内边距
   * - 数字：自定义像素值
   * - `'sm' | 'md' | 'lg'`：预设档位
   */
  padding: {
    type: [Boolean, Number, String] as PropType<true | false | number | 'sm' | 'md' | 'lg'>,
    default: true,
  },
  /** 内容区最大宽度，超出后居中 */
  maxWidth: {
    type: [Number, String] as PropType<number | string>,
  },
  /** 内容超出时在容器内部滚动 */
  scrollable: {
    type: Boolean,
  },
  /** 宽度不超过 768px 时取消一屏高度，默认开启 */
  mobileAdaptive: {
    type: Boolean,
    default: true,
  },
  /** 视口高度不超过 800px 时取消一屏高度，默认开启 */
  shortAdaptive: {
    type: Boolean,
    default: true,
  },
  /** 标题，出现标题区时内容区会自动包一层 `__body` */
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
  /**
   * 标题区吸顶：
   * - `true`：偏移量取头部导航高度
   * - 数字：指定偏移量（px）
   */
  sticky: {
    type: [Boolean, Number] as PropType<boolean | number>,
    default: false,
  },
  /** 标题的语义层级，输出为 `role="heading"` 的 `aria-level` */
  headingLevel: {
    type: Number,
    default: 1,
  },
  /** 标题区的加载态，标题与描述显示为骨架条 */
  loading: {
    type: Boolean,
  },
};

export type ContainerProps = ExtractPropTypes<typeof containerProps>;

export interface ContainerSlots {
  default: {};
  title: {};
  description: {};
  /** 标题右侧的操作区（按钮组） */
  actions: {};
  /** 标题区最右侧的附加内容 */
  extra: {};
  footer: {};
}

export const containerSlots = Object as SlotsType<ContainerSlots>;

export const containerEmits = {
  back: () => true,
};

export type ContainerEmits = typeof containerEmits;

export interface ContainerContext {
  /** 一屏高度，等价于 `calc(100vh - headerHeight)` */
  height: string;
  /** 头部导航高度（px） */
  headerHeight: number;
  /** 内容区可用高度（px）：视口高度减去头部导航高度 */
  contentHeight: number;
}

export const containerContextKey = Symbol('containerContext') as InjectionKey<ContainerContext>;

export function useContainerProvide(headerHeight: MaybeRefOrGetter<number>) {
  const viewportHeight = ref(typeof window === 'undefined' ? 0 : window.innerHeight);

  useWindowResize(() => {
    viewportHeight.value = window.innerHeight;
  });

  provide(
    containerContextKey,
    reactive({
      height: computed(() => `calc(100vh - ${toValue(headerHeight)}px)`),
      headerHeight: computed(() => toValue(headerHeight)),
      contentHeight: computed(() => Math.max(viewportHeight.value - toValue(headerHeight), 0)),
    }),
  );
}

export function useContainer() {
  const context = inject(containerContextKey, null);

  return context;
}
