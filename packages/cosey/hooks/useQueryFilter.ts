import { nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { firstQueryValue, isSameQueryValue, toQueryInput, toQueryParams } from '../utils/query';
import type { QueryInput, RawQueryValue } from '../utils/query';

/**
 * 把 url 上的原始值还原成筛选模型的值。
 * 返回 undefined 表示「该条件未提供」。
 */
export type QueryFieldParser<T = any> = (value: RawQueryValue) => T | undefined;

/** 受 url 管辖的字段的详细声明 */
export interface QueryFieldOptions<T = any> {
  /** 把 url 上的原始值还原成模型值；默认取原始字符串（`firstQueryValue`） */
  parse?: QueryFieldParser<T>;
  /** 把模型值序列化成 url 值；默认 `toQueryInput` */
  format?: (value: T) => QueryInput;
  /**
   * url 上的参数名。默认与筛选模型里的字段名一致，只有两者不同才需要写。
   *
   * 给数组表示兼容多个别名：读取按顺序取「第一个能解析出值」的参数，
   * 写入与清理都以第一个为准（别名会从 url 上删掉，不会残留旧参数）。
   */
  param?: string | string[];
}

/**
 * 受 url 管辖的字段声明。
 *
 * - 直接给解析函数：`{ postId: parseNumber }`
 * - 需要自定义序列化时给对象：`{ keyword: { parse: parseString, format: (v) => v?.trim() } }`
 * - 需要 url 参数名与字段名不同时：`{ postTypeId: { param: 'type', parse: parseNumber } }`
 */
export type QueryFieldConfig<T = any> = QueryFieldParser<T> | QueryFieldOptions<T>;

interface ResolvedField {
  /** 筛选模型里的字段名 */
  key: string;
  /** url 上的参数名，`[0]` 为主名，其余为兼容别名 */
  params: string[];
  parse: QueryFieldParser;
  format: (value: unknown) => QueryInput;
}

export interface QueryFilter<T extends Record<string, any> = Record<string, any>> {
  /** 受 url 管辖的字段名（模型字段名） */
  fieldKeys: (keyof T & string)[];
  /** 模型字段名 → url 主参数名，需要手动拼 url 时用 */
  queryParams: Partial<Record<keyof T & string, string>>;
  /** 注册「url 上的条件变了」之后的回调，通常直接传表格的 `submit`（会重置到第一页） */
  onChange(handler: () => void | Promise<void>): void;
  /** 交给 `formProps.resetValues`：点「重置」时把受管字段连同 url 上的条件一起清空 */
  resetValues(): Record<string, undefined>;
}

/**
 * 让筛选模型与 url 双向同步。
 *
 * 解决的是「A 页面点某个按钮跳到 B 页面，并把 B 页面的筛选条件预设好」这类需求：
 * 接收页在 setup 阶段声明哪些筛选字段归 url 管，url 上的条件会先落到 model，
 * 于是表格的**第一次请求**就是带筛选的，而不是先拉全量再补一次；
 * 反过来手动改筛选会写回 url，点「重置」时连 url 一起清空，刷新页面不会又筛回去。
 *
 * 三点约定：
 * - 只把筛选栏里确实有控件的字段放进来，否则会出现用户看不见、也取消不掉的隐形条件；
 * - 要在读取数据之前调用，首屏预置才会生效；
 * - 重新查询的回调用 `onChange()` 注册（数据请求方法要等组件挂载后才存在）。
 *
 * url 参数名默认等于筛选模型里的字段名，两者不一致时用 `param` 声明：
 *
 * ```ts
 * // url 上叫 type，模型里叫 postTypeId
 * useQueryFilter(queryModel, {
 *   postTypeId: { param: 'type', parse: parseNumber },
 * });
 * ```
 *
 * 用 `useTable` 时不必手动调用它 —— 把 `urlFields` 交给 `useTable` 即可，见其文档。
 *
 * @param model     筛选模型（响应式对象）
 * @param urlFields 与 url 双向同步的字段及其解析方式（key 是模型字段名）。
 *                  取名 `urlFields` 而非 `fields`，是为了与 cosey 里已有的
 *                  `FormItemContext[]`、导出列 prop、`getFieldsValue()` 等含义区分开。
 */
export function useQueryFilter<T extends Record<string, any>>(
  model: T,
  urlFields: Partial<Record<keyof T & string, QueryFieldConfig>>,
): QueryFilter<T> {
  const resolved: ResolvedField[] = Object.entries(urlFields).map(([key, config]) => {
    const field: QueryFieldOptions =
      typeof config === 'function' ? { parse: config } : (config ?? {});

    return {
      key,
      params: toQueryParams(field.param, key),
      parse: field.parse ?? firstQueryValue,
      format: field.format ?? toQueryInput,
    };
  });

  const fieldKeys = resolved.map((field) => field.key);

  // 泛型只保证「可读索引」，这里拿一个宽松视图才能按字段名回写
  const modelRef: Record<string, any> = model;

  // 一个字段都没声明时不需要路由，提前分流可以避免在「没有装路由」的环境
  // （例如纯组件预览、文档示例）调用 useRoute 而拿到 undefined。
  // urlFields 在组件生命周期内不会变，所以这里的条件分支不影响 hook 调用顺序。
  const route = resolved.length ? useRoute() : undefined;
  const router = resolved.length ? useRouter() : undefined;

  /** 读某个字段在当前 url 上的值：按参数名顺序取第一个能解析出结果的 */
  const readField = (field: ResolvedField) => {
    const present = field.params.filter((param) => route?.query[param] !== undefined);

    // 一个参数都没出现时照旧调一次 parse（自定义 parse 可能对「未提供」有默认处理）
    if (!present.length) {
      return field.parse(undefined);
    }

    for (const param of present) {
      const parsed = field.parse(route?.query[param]);

      if (parsed !== undefined) {
        return parsed;
      }
    }

    return undefined;
  };

  /** url → 模型；返回模型是否真的被改动 */
  const syncFromRoute = () => {
    let changed = false;

    for (const field of resolved) {
      const parsed = readField(field);

      if (isSameQueryValue(modelRef[field.key], parsed)) {
        continue;
      }

      modelRef[field.key] = parsed;
      changed = true;
    }

    return changed;
  };

  /** 模型 → url：只动受管字段，其他 query 原样保留 */
  const syncToRoute = () => {
    if (!route || !router) {
      return;
    }

    const query = { ...route.query };
    let changed = false;

    for (const field of resolved) {
      const [primary, ...aliases] = field.params;
      const value = toQueryInput(field.format(modelRef[field.key]));
      // 别名上还有残值时也要清掉，所以一并算作「需要改写」
      const staleAlias = aliases.some((param) => route.query[param] !== undefined);

      if (!staleAlias && isSameQueryValue(route.query[primary], value)) {
        continue;
      }

      if (value === undefined) {
        delete query[primary];
      } else {
        query[primary] = Array.isArray(value) ? value.map(String) : String(value);
      }

      for (const alias of aliases) {
        delete query[alias];
      }

      changed = true;
    }

    if (changed) {
      router.replace({ path: route.path, query });
    }
  };

  // 首屏：先把 url 上的条件落到模型，让第一次请求就带着筛选
  syncFromRoute();

  let changeHandler: (() => void | Promise<void>) | undefined;

  if (route) {
    // url → 模型。停在同一个页面时再次从别处跳进来只会改 query、组件不会重建，所以必须监听
    watch(
      () => route.fullPath,
      async () => {
        if (!syncFromRoute()) {
          return;
        }

        await nextTick();
        await changeHandler?.();
      },
    );

    // 模型 → url，保证「重置」之后刷新页面不会又筛回原来那个条件
    watch(
      () => fieldKeys.map((key) => modelRef[key]),
      () => {
        syncToRoute();
      },
    );
  }

  return {
    fieldKeys,
    queryParams: Object.fromEntries(
      resolved.map((field) => [field.key, field.params[0]]),
    ) as QueryFilter<T>['queryParams'],
    onChange(handler) {
      changeHandler = handler;
    },
    resetValues: () => Object.fromEntries(fieldKeys.map((key) => [key, undefined])),
  };
}
