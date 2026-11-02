import { isEmpty } from '../../../utils';
import { type TagProps } from 'element-plus';
import { get } from 'lodash-es';

/**
 * 值 → 文案 + 颜色的选项项，与后台常见的 `*Options` 数组同形（`[{ label, value, tag }]`）。
 */
export interface RendererOption {
  label: string | number;
  value: string | number | boolean;
  tag?: TagProps['type'];
}

/** 所有 renderer 都支持的通用选项 */
export interface RendererBaseOptions {
  /**
   * 空值（`null` / `undefined` / `''` / `[]`）时显示的占位，默认空字符串。
   * 注意 `0` 与 `false` 不算空，不会被它吃掉。
   */
  empty?: string;
  /**
   * 兜底字段。`cellValue` 为空时，按顺序从 `row` 上取第一个非空的。
   *
   * 用来表达 `row.actor?.nickname || row.actor?.username` 这种「主字段没值就退回备用字段」，
   * 不必为此写一个 `format`。
   */
  fallback?: string[];
}

/**
 * 取值：优先用 Element Plus 传来的 `cellValue`，空了才走 `fallback` 链。
 *
 * 两者都空时返回 `undefined`，由调用方决定占位（`empty`）。
 */
export function resolveCellValue(row: any, cellValue: any, options: RendererBaseOptions) {
  if (!isEmpty(cellValue)) {
    return cellValue;
  }

  for (const path of options.fallback ?? []) {
    const value = get(row, path);

    if (!isEmpty(value)) {
      return value;
    }
  }

  return undefined;
}

/**
 * 按值找选项。宽松比较：后端把枚举回成 `'1'` 时也能命中 `1`。
 */
export function resolveOption(options: readonly RendererOption[] | undefined, value: any) {
  if (!options?.length) {
    return undefined;
  }

  return options.find((item) => item.value === value || Number(item.value) === Number(value));
}

/**
 * `boolean` renderer 的真值判定。
 *
 * 不能直接 `Boolean(value)`：后端枚举常回 `1` / `'1'`，而 `'0'` 是 truthy，
 * 那样「关闭」会被渲染成「开启」。
 */
export function isTruthy(value: any) {
  return value === true || value === 1 || value === '1';
}
