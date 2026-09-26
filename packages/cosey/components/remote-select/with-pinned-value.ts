/** 远程选择器的选项数据源；返回分页结构或直接返回数组都可以 */
export type RemoteSelectApi = (params?: any) => Promise<any> | any;

/**
 * 远程选择器的配置形态。
 *
 * 这里用结构化声明而不是直接引用 `co-remote-select` 的 props 类型，
 * 是为了让本模块不依赖 remote-select 组件：`table` 会反向依赖本模块，
 * 若本模块再依赖 remote-select，就会形成运行时循环引用。
 * 因此 `keys.list` 的默认值也写作字面量 `'list'`（与 `defaultTableConfig` 一致）。
 */
export interface RemoteSelectLikeConfig {
  api: RemoteSelectApi;
  props?: { label?: string; value?: string } & Record<string, any>;
  keys?: { list?: string; total?: string } & Record<string, any>;
  immediate?: boolean;
  [key: string]: any;
}

export interface WithPinnedValueOptions {
  /** 选项里代表「值」的字段，默认取 `config.props.value` */
  valueKey?: string;
  /** 补查目标项时使用的查询参数，默认按 valueKey 精确查 */
  matchParams?: (value: string | number) => Record<string, any>;
}

/**
 * 让「当前值不在选项里」时也能正确显示标签。
 *
 * 远程下拉默认要展开后才按需拉数据，如果当前值不在拉回来的那一页里，
 * el-select 找不到对应选项，就会把 value 直接当标签显示（例如数字 5）。
 * 典型场景是把 url 上的 id 预置成筛选条件 —— 此时用户根本没打开过下拉。
 *
 * 这里做两件事：
 * - `immediate: true`：挂载即加载一次，让初始值能解析出标签；
 * - 包一层 `api`：目标不在结果里（例如不在第一页）就单独取回来置顶。
 *
 * 支持单选与多选（值是数组时逐个补查）。
 *
 * ```ts
 * withPinnedValue(selectConfig, () => model.postId);
 * ```
 */
export function withPinnedValue<C extends RemoteSelectLikeConfig>(
  config: C,
  getPinnedValue: () => number | string | (number | string)[] | undefined | null,
  options: WithPinnedValueOptions = {},
): C {
  const valueKey = options.valueKey ?? config.props?.value ?? 'id';
  const listKey = config.keys?.list ?? 'list';
  const matchParams =
    options.matchParams ??
    ((value: string | number) => ({ page: 1, pageSize: 1, [valueKey]: value }));

  const readList = (result: unknown): any[] => {
    const list = listKey ? (result as Record<string, any>)?.[listKey] : result;

    return Array.isArray(list) ? list : [];
  };

  return {
    ...config,
    immediate: true,
    api: async (params?: any) => {
      const result = await config.api(params);
      const pinned = getPinnedValue();

      const targets = (Array.isArray(pinned) ? pinned : [pinned]).filter(
        (value): value is string | number => value !== undefined && value !== null && value !== '',
      );

      if (!targets.length) {
        return result;
      }

      const list = readList(result);
      const missing = targets.filter((value) => !list.some((item) => item?.[valueKey] === value));

      if (!missing.length) {
        return result;
      }

      const fetched = await Promise.all(missing.map((value) => config.api(matchParams(value))));
      const matched = fetched.map((item) => readList(item)[0]).filter(Boolean);

      if (!matched.length) {
        return result;
      }

      return listKey
        ? { ...(result as Record<string, any>), [listKey]: [...matched, ...list] }
        : [...matched, ...list];
    },
  } as C;
}
