import { withPinnedValue } from '../remote-select/with-pinned-value';
import type { RemoteSelectLikeConfig } from '../remote-select/with-pinned-value';
import type { TableQueryScheme } from '../table-query';

export interface PinnedSelectSchemeOptions {
  /** 字段名，同时是筛选模型里的 key */
  prop: string;
  /** 筛选栏里的标签 */
  label: string;
  /** 远程选择器配置 */
  select: RemoteSelectLikeConfig;
  /**
   * 筛选模型，用来读当前值并生成重建用的 key。
   *
   * 类型故意放宽成 `object`：筛选模型常是 `interface` 声明，
   * 而 interface 不满足 `Record<string, any>` 的索引签名要求。
   */
  model: object;
  [key: string]: any;
}

/** 比普通 scheme 多一个由当前值决定的 `key` */
export type PinnedSelectScheme = TableQueryScheme & { key: string };

/**
 * 生成「关联筛选字段」的 scheme，交给 `formSchemes` 使用。
 *
 * 比直接写 `fieldProps: withPinnedValue(...)` 多挂了一个「以当前值为内容」的 `key`，
 * 原因是 `co-remote-select` 只在**挂载时**按 `immediate` 拉一次数据来解析当前值的标签。
 * 当筛选值由 url 变化驱动时（停在同一个页面、只是 query 变了），组件不会重建，
 * 也就不会重新解析，标签会退化成裸 id（例如显示数字 `17`）。
 *
 * 值一变就换 key，让这个 form-item 重建，重建后 `immediate` 会重新拉取并把当前值解析成标签。
 *
 * ```ts
 * const [tableProps, { reload }] = useTable({
 *   api: getComments,
 *   columns: [...],
 *   urlFields: { postId: parseNumber },
 *   formSchemes: (model) => [
 *     { prop: 'content', label: '评论内容', modelValue: '' },
 *     pinnedSelectScheme({
 *       prop: 'postId',
 *       label: '所属文章',
 *       select: postSelectConfig,
 *       model,
 *     }),
 *   ],
 * });
 * ```
 */
export function pinnedSelectScheme(options: PinnedSelectSchemeOptions): PinnedSelectScheme {
  const { prop, label, select, model, ...rest } = options;
  const source = model as Record<string, any>;

  return {
    ...rest,
    prop,
    label,
    fieldType: 'remoteselect',
    fieldProps: withPinnedValue(select, () => source[prop]),
    key: `${prop}:${source[prop] ?? ''}`,
  };
}
