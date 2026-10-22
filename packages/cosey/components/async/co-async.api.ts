import { type ExtractPropTypes, type PropType, type Ref, type SlotsType } from 'vue';

export interface AsyncState<T = any> {
  /** `useFetch` 的 `isFetching` */
  isFetching?: Ref<boolean> | boolean;
  loading?: Ref<boolean> | boolean;
  data?: Ref<T> | T;
  error?: Ref<any> | any;
  /** 重试时调用的函数 */
  execute?: (...args: any[]) => any;
}

export const coAsyncProps = {
  /** 直接传入 `useFetch()` 的返回值 */
  state: {
    type: Object as PropType<AsyncState>,
  },
  /** 也可单独控制：加载中 */
  loading: {
    type: Boolean,
    default: undefined,
  },
  /** 单独控制：错误 */
  error: {
    type: null as unknown as PropType<any>,
    default: undefined,
  },
  /** 单独控制：空数据；不传时会根据 `state.data` 是否为数组自动判断 */
  empty: {
    type: Boolean,
    default: undefined,
  },
  emptyText: {
    type: String,
  },
  /** 加载态骨架屏行数，传 `false` 关闭（改由 `#loading` 插槽决定） */
  skeleton: {
    type: [Boolean, Number] as PropType<boolean | number>,
    default: 4,
  },
  /** 延迟多少毫秒才显示加载态，避免闪烁，默认 0 不延迟 */
  delay: {
    type: Number,
    default: 0,
  },
  /** 重试回调，不传时会调用 `state.execute()` */
  retry: {
    type: Function as PropType<() => any>,
  },
  retryText: {
    type: String,
  },
};

export type CoAsyncProps = ExtractPropTypes<typeof coAsyncProps>;

/**
 * `#default` 插槽收到的参数。
 *
 * `T` 为 `state.data` 解包后的类型；直接传 `useFetch()` 的返回值时，
 * 可在 `useAsyncSlotProps` 里显式标注获得更精确的提示：
 *
 * ```ts
 * type UserSlot = CoAsyncSlotProps<User[]>;
 * ```
 */
export interface CoAsyncSlotProps<T = any> {
  /** `state.data` 解包后的值 */
  data: T | undefined;
  /** 是否加载中 */
  loading: boolean;
  /** 错误对象，无错误时为 `undefined` */
  error: any;
  /** 是否空数据 */
  isEmpty: boolean;
  /** 手动重试（同错误态的按钮） */
  retry: () => void;
}

export interface CoAsyncSlots<T = any> {
  default: CoAsyncSlotProps<T>;
  loading: { retry: () => void };
  empty: { retry: () => void };
  error: { error: any; retry: () => void };
}

export const coAsyncSlots = Object as SlotsType<CoAsyncSlots>;

export const coAsyncEmits = {
  retry: () => true,
};
