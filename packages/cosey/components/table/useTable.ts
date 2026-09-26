import { computed, mergeProps, reactive, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import { type TableExpose, type TableProps, tableExposeKeys } from './table.api';
import { type TableQueryProps, type TableQueryScheme } from '../table-query';
import { createMergedExpose, warningOnce } from '../../utils';
import { useQueryFilter } from '../../hooks/useQueryFilter';
import type { QueryFieldConfig, QueryFilter } from '../../hooks/useQueryFilter';

export type UseTableProps = TableProps & { [prop: PropertyKey]: any };

/**
 * 筛选表单的方案。
 *
 * - 数组：静态，不会跟随筛选值变化；
 * - getter 或 `computed`：会随其依赖变化；
 * - 工厂 `(model) => [...]`：**推荐**。工厂内部读到的任何响应式值
 *   （权限码、选项接口返回值…）都会被表格的 props computed 收集，
 *   同时能拿到筛选模型 —— 关联字段需要它来生成重建用的 `key`（见 `pinnedSelectScheme`）。
 *
 * 工厂应当只做组装、不产生副作用：它除了在表格 props 里求值，
 * 还会在初始化时被调用一次（用于收集各项的 `modelValue` 作为字段初值）。
 */
export type TableSchemes<T> =
  | MaybeRefOrGetter<TableQueryScheme[]>
  | ((model: T) => TableQueryScheme[]);

/**
 * 查询表单的其它配置。
 *
 * `model`（由内部接管）、`resetValues`（由 url 同步自动接管）会在内部被覆盖；
 * `schemes` 建议提到顶层 `formSchemes`，留在 `formProps` 里也支持（作为兜底）。
 */
export type UseTableFormProps = Omit<TableQueryProps, 'model' | 'resetValues'>;

/**
 * `useTable` 的入参。
 *
 * 以 `TableProps` 为底，因此 `transform-params` / `pagination` / `keys` 等属性都有类型提示；
 * 只把 `columns` / `actionColumn` 放宽成 `MaybeRefOrGetter`（便于跟随响应式数据重算），
 * 并去掉由内部接管的 `api` / `formProps.model` / `getExpose`。
 */
export type UseTableOptions<T extends object = Record<string, any>> = Omit<
  TableProps,
  'columns' | 'actionColumn' | 'formProps' | 'api' | 'getExpose'
> & {
  /** 请求数据的函数 */
  api?: TableProps['api'];
  /** 列定义；传函数或 `computed` 可跟随响应式数据（如权限码）重算 */
  columns?: MaybeRefOrGetter<TableProps['columns']>;
  /** 操作列配置；同样支持传函数 */
  actionColumn?: MaybeRefOrGetter<TableProps['actionColumn']>;
  /** 筛选表单的 schemes，见 `TableSchemes`；也可以写在 `formProps.schemes`（兜底） */
  formSchemes?: TableSchemes<T>;
  /**
   * 与 url 双向同步的筛选字段。
   *
   * 声明后：url 上的条件会先落到模型（**第一次请求**就带筛选）、
   * 手动改筛选会写回 url、点「重置」会连 url 一起清空。
   * 只放筛选栏里确实有控件的字段，否则会出现用户看不见、也取消不掉的隐形条件。
   *
   * 为什么不叫 `fields`：`fields` 在 cosey 里已分别指「表单暴露的 `FormItemContext[]`」
   * 与「表格导出时的列 prop」，而且同一个 `useTable` 的返回值上还有
   * `getFieldsValue()`（查询表单的**全部**字段值）。叫 `urlFields` 才能点明
   * 这一组的区别在于**受 url 管辖**。
   */
  urlFields?: Partial<Record<keyof T & string, QueryFieldConfig>>;
  /**
   * url 上的筛选条件变化后（例如再次从别处带着条件跳进来）怎么重查：
   * `'submit'` 回到第 1 页（默认），`'reload'` 保留当前页。
   */
  onQueryChange?: 'submit' | 'reload';
  /** 查询表单的其它配置；`model` / `resetValues` 由内部接管 */
  formProps?: UseTableFormProps;
};

/**
 * `useTable` 第二个返回值：`co-table` 暴露的方法，
 * 外加两个只有集成场景才用得到的对象。
 */
export interface UseTableExpose<T extends object = Record<string, any>> extends TableExpose {
  /** 筛选模型：表格之外还要读 / 写筛选值时用它 */
  model: T;
  /** url 同步能力，需要 `fieldKeys` / `queryParams` / `onChange` 时取 */
  queryFilter: QueryFilter;
}

/** `useTable` 的返回值：与 `[tableProps, expose]` 的元组形态保持一致 */
export type UseTableResult<T extends object = Record<string, any>> = [
  UseTableProps,
  UseTableExpose<T>,
];

// `columns` 缺省时复用同一个空数组，避免每次重算都换新引用
// （`co-table` 会 watch `props.columns` 的引用，一变就用快照覆盖用户的列设置）
const EMPTY_COLUMNS: NonNullable<UseTableProps['columns']> = [];

/** 由 `useTable` 自己消费、不能透传给 co-table 的配置项 */
const MANAGED_KEYS = ['formSchemes', 'urlFields', 'onQueryChange', 'columns', 'actionColumn'];

/** `formProps` 里由内部接管、必须剔除的键（`model` / `schemes` / `resetValues`） */
const MANAGED_FORM_KEYS = ['model', 'schemes', 'resetValues'];

/**
 * 配置表格属性、筛选栏与 url 同步。
 *
 * 表格式的增删改查页面里，「筛选模型 → 请求参数 → url」这条链路有固定的先后顺序，
 * 手写容易出错（模型必须先于首次请求存在、`schemes` 必须在 `computed` 里求值、
 * 重查回调要等表格挂载后才能注册）。`useTable` 把这些顺序固定在内部：
 *
 * 1. 建筛选模型（`formSchemes` 各项的 `modelValue` 打底，`urlFields` 声明的字段补齐为 `undefined`）；
 * 2. `useQueryFilter` 把 url 上的条件落到模型 —— 必须在首次请求之前，
 *    否则会先拉一次全量再补一次；
 * 3. 在 `computed` 里组装最终 props（`formSchemes` 在这里求值，关联字段的 `key`
 *    才会跟着筛选值重算）；
 * 4. 把「url 条件变了」接到表格的 `submit()` / `reload()` 上。
 *
 * ```ts
 * const [tableProps, { reload, model }] = useTable<CommentQuery>({
 *   api: getComments,
 *   columns: [...],
 *   actionColumn: { label: '操作', slots: 'action', fixed: 'right', minWidth: 140 },
 *   urlFields: { postId: parseNumber },
 *   formSchemes: (queryModel) => [
 *     { prop: 'content', label: '评论内容', modelValue: '' },
 *     pinnedSelectScheme({
 *       prop: 'postId',
 *       label: '所属文章',
 *       select: postSelectConfig,
 *       model: queryModel,
 *     }),
 *   ],
 * });
 * ```
 *
 * 需要整份 props 跟响应式数据联动时（例如列里用了 `t()`、`hasCode()`），
 * 把配置写成 getter 或 `computed` —— 它会在内部的 `computed` 里求值：
 *
 * ```ts
 * const [tableProps, { reload }] = useTable(() => ({
 *   api: getRoles,
 *   columns: [{ prop: 'name', label: t('rbac.roleName') }],
 * }));
 * ```
 */
export function useTable<T extends object = Record<string, any>>(
  options: MaybeRefOrGetter<UseTableOptions<T>>,
): UseTableResult<T> {
  // 先解析一次，取出「与筛选模型有关」的配置：
  // 模型必须先于最终 props 存在，而这些配置只用来建模型，所以只读一次即可。
  const initial = toValue(options);
  const { urlFields, onQueryChange } = initial;
  const fieldKeys = Object.keys(urlFields ?? {});
  const initialFormProps = initial.formProps as Record<string, any> | undefined;
  const externalModel = initialFormProps?.model as Record<string, any> | undefined;
  // `formProps.schemes` 是 co-table-query 既有的写法，作为兜底保留
  const initialSchemes = initial.formSchemes ?? initialFormProps?.schemes;

  warningOnce(
    !externalModel,
    'useTable: 筛选模型由内部接管，建议不要传 `formProps.model`，初值写在 `formSchemes` 各项的 `modelValue` 上即可。' +
      '传入的 `model` 必须是响应式对象（`reactive`），且 `formSchemes` 里同名项的 `modelValue` 不再生效。',
  );

  // ① 筛选模型：默认内部创建；传了 `formProps.model` 就复用（兼容旧写法）
  const modelRef: Record<string, any> = reactive(externalModel ?? {});
  const typedModel = modelRef as unknown as T;

  /** 求值筛选表单方案：数组 / getter 直接取值，工厂则把模型交给它 */
  const resolveSchemes = (source: TableSchemes<T> | undefined) => {
    const list =
      typeof source === 'function'
        ? (source as (queryModel: T) => TableQueryScheme[])(typedModel)
        : toValue(source as MaybeRefOrGetter<TableQueryScheme[]>);

    return (list ?? []).filter((scheme) => !!scheme && typeof scheme === 'object');
  };

  // 初值：`scheme.modelValue` 即该字段的默认值（与 `co-table-query` 的约定一致）。
  // 与 `co-table-query` 自己初始化模型时的行为保持一致 —— 每个 scheme 都落到模型上，
  // 没有 `modelValue` 的置为 `undefined`，这样模型里的键与筛选栏里的字段一一对应。
  // 必须写在 url 落值之前，否则会盖掉 url 带过来的条件。
  for (const scheme of resolveSchemes(initialSchemes)) {
    const prop = scheme.prop as string | undefined;

    if (prop && modelRef[prop] === undefined) {
      modelRef[prop] = scheme.modelValue;
    }
  }

  // 受 url 管辖但没写进 `formSchemes` 的字段也要先建出键，
  // 「重置」与 url 回写才有确定的目标。
  for (const key of fieldKeys) {
    if (!(key in modelRef)) {
      modelRef[key] = undefined;
    }
  }

  // ② 必须在组装 props 之前：url 条件先落到模型，首次请求才带着筛选
  const queryFilter = useQueryFilter(
    modelRef,
    (urlFields ?? {}) as Record<string, QueryFieldConfig>,
  );

  let tableRef: TableExpose;

  const getExpose = (expose: TableExpose) => {
    tableRef = expose;
  };

  // ③ 最终 props 在 computed 里组装，`formSchemes` 中的关联字段才会跟着筛选值重算
  const mergedProps = computed(() => {
    const raw = toValue(options);
    const { formSchemes, formProps, columns, actionColumn } = raw;
    // 其余（api / height / pagination …）原样透传给 co-table，
    // 由本函数消费的配置不能漏出去，否则会被 v-bind 到组件上
    const rest: Record<string, any> = { ...raw };

    for (const key of MANAGED_KEYS) {
      delete rest[key];
    }

    const formPropsRest: Record<string, any> = { ...(formProps ?? {}) };

    for (const key of MANAGED_FORM_KEYS) {
      delete formPropsRest[key];
    }

    const schemeList = resolveSchemes(formSchemes ?? formProps?.schemes);
    // 没有筛选栏就不要注入 formProps：co-table 只在 formProps 存在时渲染查询栏
    const hasQuery = schemeList.length > 0 || !!formProps;

    return mergeProps(
      { getExpose },
      {
        ...rest,
        columns: toValue(columns) ?? EMPTY_COLUMNS,
        actionColumn: toValue(actionColumn),
        formProps: hasQuery
          ? {
              ...formPropsRest,
              model: modelRef,
              schemes: schemeList,
              // 只声明了受 url 管辖的字段时才接管「重置」，
              // 免得覆盖调用方自己写的 resetValues
              ...(fieldKeys.length ? { resetValues: queryFilter.resetValues } : {}),
            }
          : undefined,
      },
    ) as UseTableProps;
  });

  const expose = createMergedExpose<TableExpose>(tableExposeKeys, () => tableRef);

  // ④ url 上的条件变了（例如再次从别处带着条件跳进来）就按新条件重查
  queryFilter.onChange(() => (onQueryChange === 'reload' ? expose.reload?.() : expose.submit?.()));

  return [mergedProps, { ...expose, model: typedModel, queryFilter }] as UseTableResult<T>;
}
