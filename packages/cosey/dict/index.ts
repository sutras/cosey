import {
  type MaybeRefOrGetter,
  type Ref,
  computed,
  getCurrentInstance,
  ref,
  shallowRef,
  toValue,
  watch,
} from 'vue';
import { warningOnce } from '../utils/warning';
import { getOutsideLocale, useLocale } from '../hooks/useLocale';
import { translateMessage } from '../locale';

/**
 * 字典名表：由应用通过模块增强补全，补全后 `useDict` / `co-dict-tag` 的 `dict`
 * 都能获得字面量提示。
 *
 * ```ts
 * declare module 'cosey' {
 *   interface DictNameMap {
 *     user_status: true;
 *     yes_no: true;
 *   }
 * }
 * ```
 *
 * 不补全时退化为 `string`，不产生任何类型错误。
 */
export interface DictNameMap {}

type LiteralUnion<T extends string> = T | (string & {});

/** 字典名；扩展 `DictNameMap` 后自动变成联合类型 */
export type DictName = [keyof DictNameMap] extends [never]
  ? string
  : LiteralUnion<Extract<keyof DictNameMap, string>>;

/** 字典项 */
export interface DictItem<V = string | number> {
  /** 文案。需要多语言时改用 `labelKey` */
  label?: string;
  /**
   * i18n 文案 key（如 `co.user.status.enabled`），优先于 `label`。
   *
   * 渲染时按当前语言翻译，切换语言会自动更新。
   */
  labelKey?: string;
  value: V;
  /** 标签颜色：`primary` / `success` / `warning` / `danger` / `info`，也接受自定义色值 */
  color?: string;
  disabled?: boolean;
  [key: string]: any;
}

/** 对象形式的字典：`{ 1: '启用', 0: '禁用' }` 或 `{ 1: { label: '启用', color: 'success' } }` */
export type DictRecord = Record<string, string | Partial<DictItem>>;

export type DictSource =
  | DictItem[]
  | DictRecord
  | (() => DictItem[] | DictRecord | Promise<DictItem[] | DictRecord>);

type DictResolver = () => DictItem[] | DictRecord | Promise<DictItem[] | DictRecord>;

interface DictState {
  items: Ref<DictItem[]>;
  loading: Ref<boolean>;
  error: Ref<any>;
  loaded: boolean;
  promise: Promise<void> | null;
}

const sources = new Map<string, DictSource>();
const states = new Map<string, DictState>();

/** 字典注册后递增，让已经调用的 `useDict` 重新求值 */
const version = ref(0);

function normalize(source: DictItem[] | DictRecord): DictItem[] {
  if (Array.isArray(source)) {
    return source.map((item) => ({
      ...item,
      label: item.label ?? String(item.value),
    }));
  }

  return Object.keys(source).map((value) => {
    const item = source[value];

    if (typeof item === 'string') {
      return { value, label: item };
    }

    return { ...item, value: item.value ?? value, label: item.label ?? value };
  });
}

function createState(): DictState {
  return {
    items: shallowRef<DictItem[]>([]),
    loading: ref(false),
    error: shallowRef<any>(),
    loaded: false,
    promise: null,
  };
}

function getState(name: string) {
  let state = states.get(name);

  if (!state) {
    state = createState();
    states.set(name, state);
  }

  return state;
}

function resolve(name: string): Promise<void> {
  const state = getState(name);
  const source = sources.get(name);

  if (!source) {
    return Promise.resolve();
  }

  if (state.loaded && state.promise) {
    return state.promise;
  }

  if (state.promise) {
    return state.promise;
  }

  if (typeof source !== 'function') {
    state.items.value = normalize(source);
    state.loaded = true;
    return Promise.resolve();
  }

  state.loading.value = true;
  state.error.value = undefined;

  const promise = Promise.resolve((source as DictResolver)())
    .then((result) => {
      state.items.value = normalize(result);
      state.loaded = true;
    })
    .catch((err) => {
      state.error.value = err;
      warningOnce(false, `Failed to load dictionary "${name}"`);
    })
    .finally(() => {
      state.loading.value = false;
      state.promise = null;
    });

  state.promise = promise;

  return promise;
}

/** 一次性注册多个字典；键名会获得 `DictNameMap` 的补全 */
export type DictRegistry = { [K in DictName]?: DictSource };

/**
 * 注册字典。值可以是数组、对象，或返回它们的（异步）函数。
 *
 * ```ts
 * registerDicts({
 *   user_status: [
 *     { value: 1, labelKey: 'co.user.status.enabled', color: 'success' },
 *     { value: 0, labelKey: 'co.user.status.disabled', color: 'info' },
 *   ],
 *   // 对象形式
 *   yes_no: { 1: '是', 0: '否' },
 *   // 异步
 *   dept: () => getDeptOptions(),
 * });
 * ```
 *
 * 通常在 `launch({ dict })` 里一次性配置；需要运行时注册时直接调用本函数。
 */
export function registerDicts(dicts: DictRegistry) {
  Object.keys(dicts).forEach((name) => {
    const source = dicts[name];

    if (source === undefined) {
      return;
    }

    sources.set(name, source);
    // 重新注册后让旧的缓存失效
    const state = states.get(name);
    if (state) {
      state.loaded = false;
      state.promise = null;
    }
  });

  version.value++;
}

/** `registerDicts` 的别名，语义更贴近「设置」 */
export function setDicts(dicts: DictRegistry) {
  registerDicts(dicts);
}

export function hasDict(name: DictName) {
  return sources.has(name);
}

export function getDictNames() {
  return [...sources.keys()];
}

/** 清空注册表（主要用于测试） */
export function clearDicts() {
  sources.clear();
  states.clear();
  version.value++;
}

export interface UseDictOptions {
  /** 是否立即加载，默认 `true` */
  immediate?: boolean;
}

export interface UseDictReturn<V = string | number> {
  /** 字典项 */
  items: Ref<DictItem<V>[]>;
  /** `items` 的别名，便于直接当 `options` 用 */
  options: Ref<DictItem<V>[]>;
  loading: Ref<boolean>;
  error: Ref<any>;
  /** 取字典项 */
  getItem: (value: any) => DictItem<V> | undefined;
  /**
   * 取文案：`labelKey` 存在时按当前语言翻译，否则用 `label`；
   * 都找不到时回退到 `fallback`，再回退到原值。
   */
  getLabel: (value: any, fallback?: string) => string;
  /** `getLabel` 的语义化别名 */
  getText: (value: any, fallback?: string) => string;
  /** 取颜色（`el-tag` 的 `type`） */
  getColor: (value: any) => string | undefined;
  /** 重新加载 */
  reload: () => Promise<void>;
}

/**
 * 使用字典。
 *
 * ```ts
 * const { options, getLabel, getColor } = useDict('user_status');
 * ```
 *
 * 字典名支持 ref / getter，切换时自动重新加载。
 */
export function useDict<V = string | number>(
  name: MaybeRefOrGetter<DictName | undefined | null>,
  options: UseDictOptions = {},
): UseDictReturn<V> {
  const { immediate = true } = options;

  // 组件内用注入的 locale；在 store / 普通模块里调用时退回默认语言，避免 inject 告警
  const { t } = getCurrentInstance() ? useLocale() : getOutsideLocale();

  const nameRef = computed(() => toValue(name) ?? '');

  const state = computed(() => {
    // 注册表变化后重新取 state
    void version.value;

    return nameRef.value ? getState(nameRef.value) : null;
  });

  if (immediate) {
    watch(
      [nameRef, version],
      ([value]) => {
        if (value) {
          resolve(value);
        }
      },
      { immediate: true },
    );
  }

  const items = computed(() => (state.value?.items.value ?? []) as DictItem<V>[]);

  const find = (value: any) =>
    items.value.find((item) => item.value === value) ??
    items.value.find((item) => String(item.value) === String(value));

  /**
   * `labelKey` 的解析顺序：
   * 1. 应用自己的 vue-i18n 词条（`launch({ locale: { messages: [{ app }] } })`）
   * 2. 框架内置词条（`co.*`，由 `useLocale()` 读 cosey 语言包）
   *
   * 两条都读不到时退回 key 本身，便于发现漏配。
   */
  const translateKey = (key: string) => translateMessage(key) ?? t(key);

  const resolveLabel = (item: DictItem<V>) => {
    if (item.labelKey) {
      return translateKey(item.labelKey);
    }

    return item.label ?? String(item.value);
  };

  const getLabel = (value: any, fallback?: string) => {
    const item = find(value);

    if (item) {
      return resolveLabel(item);
    }

    if (fallback !== undefined) {
      return fallback;
    }

    return value === null || value === undefined || value === '' ? '' : String(value);
  };

  return {
    items,
    options: items,
    loading: computed(() => state.value?.loading.value ?? false),
    error: computed(() => state.value?.error.value),
    getItem: (value) => find(value),
    getLabel,
    getText: getLabel,
    getColor: (value) => find(value)?.color,
    reload: () => {
      const current = state.value;

      if (current) {
        current.loaded = false;
        current.promise = null;
      }

      return nameRef.value ? resolve(nameRef.value) : Promise.resolve();
    },
  };
}
