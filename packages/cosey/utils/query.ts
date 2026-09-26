import type { LocationQueryRaw, LocationQueryValue } from 'vue-router';

/**
 * url 查询参数（query）的读写工具。
 *
 * 这些函数只处理「值」本身，不关心组件与路由实例，
 * 因此可以脱离表格、在任意需要解析/拼接 url 的地方使用。
 *
 * 核心约定：`undefined` 表示「该条件不存在」。
 * url 上的 `?postId=` 与「没有 postId」等价，都会被收敛成 `undefined`，
 * 这样「有值才写进 url、清空即从 url 移除」才能成立。
 */

/** url 上的原始值：可能是单值，也可能是 `?a=1&a=2` 这种数组 */
export type RawQueryValue = LocationQueryValue | LocationQueryValue[] | undefined;

/** 可写入 url 的值 */
export type QueryInput = string | number | boolean | null | undefined | (string | number)[];

/**
 * 取单值：数组取第一个，「空」统一视为未提供。
 *
 * url 上的 `?postId=` 和「没有 postId」是等价的，都不该当成筛选条件。
 */
export function firstQueryValue(value: RawQueryValue): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;

  return raw === null || raw === undefined || raw === '' ? undefined : raw;
}

/** 取多值：时间区间这类字段在 url 上会出现多次 */
export function queryArrayValue(value: RawQueryValue): string[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const list = (Array.isArray(value) ? value : [value]).filter(
    (item): item is string => item !== null && item !== '',
  );

  return list.length ? list : undefined;
}

/** 解析成数字（id 类的筛选条件用），非法值当作未提供 */
export function parseNumber(value: RawQueryValue): number | undefined {
  const raw = firstQueryValue(value);

  if (raw === undefined) {
    return undefined;
  }

  const parsed = Number(raw);

  return Number.isFinite(parsed) ? parsed : undefined;
}

/** 解析成字符串 */
export function parseString(value: RawQueryValue): string | undefined {
  return firstQueryValue(value);
}

/** 解析成字符串数组（时间区间等） */
export function parseStringArray(value: RawQueryValue): string[] | undefined {
  return queryArrayValue(value);
}

/**
 * 归一化「一个字段用哪些 url 参数名」。
 *
 * 参数名默认与模型字段名一致（传 undefined 时回落到 fallback），
 * 给数组则表示兼容多个别名，`[0]` 是读写时使用的主名。
 */
export function toQueryParams(param: string | string[] | undefined, fallback: string): string[] {
  const params = Array.from(
    new Set([param ?? fallback].flat().filter((item): item is string => !!item)),
  );

  return params.length ? params : [fallback];
}

/**
 * 归一化成「能写进 url 的形态」：空值一律收敛成 undefined。
 *
 * 与 `firstQueryValue` 相反，这是「模型 → url」方向的正向转换。
 */
export function toQueryInput(value: unknown): QueryInput {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    const list = value.map((item) => String(item)).filter((item) => item !== '');

    return list.length ? list : undefined;
  }

  return String(value);
}

/** 归一化成字符串数组，便于比较 */
function toQueryList(value: unknown): string[] | undefined {
  const input = toQueryInput(value);

  if (input === undefined) {
    return undefined;
  }

  if (Array.isArray(input)) {
    return input.map((item) => String(item));
  }

  return [String(input)];
}

/**
 * 判断两个值在 url 上是否等价。
 *
 * 用于避免「模型 ↔ url」来回同步时产生无意义的 replace；
 * 顺带忽略 `1` 与 `['1']`、`1` 与 `'1'` 这类表示上的差异。
 */
export function isSameQueryValue(a: unknown, b: unknown): boolean {
  const left = toQueryList(a);
  const right = toQueryList(b);

  if (left === undefined || right === undefined) {
    return left === right;
  }

  return left.length === right.length && left.every((item, index) => item === right[index]);
}

/**
 * 归一化 query 对象：剔除空值、数字统一转字符串。
 *
 * 用于「跳到另一个页面并带上筛选条件」时拼出干净的 url，
 * 不会留下 `?postId=` 这种没有意义的空条件。
 */
export function compactQuery(query: Record<string, QueryInput>): LocationQueryRaw {
  const result: LocationQueryRaw = {};

  for (const [key, value] of Object.entries(query)) {
    const input = toQueryInput(value);

    if (input === undefined) {
      continue;
    }

    result[key] = Array.isArray(input) ? input.map(String) : String(input);
  }

  return result;
}
