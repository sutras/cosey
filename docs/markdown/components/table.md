# Table 表格

## 简介

在ElTable基础上，新增分页、查询表单、工具栏等功能，预设了默认的使用方式，简化样板代码。

## 代码演示

### 基础使用

要建立一个增删改查表格，可通过以下步骤：

- 首先在 `ConfigProvider` 中配置全局列表接口结构；
- 使用 `useTable` 配置表格属性，简化表格组件方法的调用；
- 使用 `columns` 属性配置表格列；
- 使用 `actionColumn` 属性配置操作列；
- 使用 `formProps` 属性配置查询表单；
- 使用 `api` 属性建立与服务器的联系；
- 使用对话框等组件创建“新增/编辑”表单。

::: demo

table/basic

:::

### 操作按钮的声明

操作列上的按钮可以直接用 `actions` 声明，不必再开一个插槽手写 `<co-table-action>`——底层渲染的就是它，所以 `TableActionItemProps` 的字段（`label` / `icon` / `type` / `popconfirm` / `dropdown` …）全都照旧。

`actions` 推荐写成工厂 `(row, $index) => [...]`：**它在每次渲染时求值**，每一项都能按当前行决定，工厂里读到的响应式值（权限码、开关状态…）也会被收集、跟着更新。

```ts
actionColumn: {
  label: '操作',
  fixed: 'right',
  minWidth: 210,
  actions: (row) => [
    {
      visible: hasCode(AuthCode.USER_UPDATE),
      label: '编辑',
      icon: 'bi bi-pencil',
      onClick: () => upsert.edit(row),
    },
    {
      label: '删除',
      icon: 'bi bi-trash',
      type: 'danger',
      popconfirm: {
        title: `确定删除「${row.nickname}」？`,
        confirm: () => deleteUser(row.id).then(reload),
      },
    },
  ],
}
```

::: demo

table/actions

:::

> 写成静态数组（`actions: [...]`）也能用，但数组只在 setup 阶段求值一次：`visible: hasCode(...)` 会变成快照，权限后到时不会重算。确实不需要行数据时再这么写。

按钮之间的分割线默认显示，用 `divider: false` 关掉；不传则走全局配置 `config.tableAction.divider`。

### 筛选条件与 url 同步

`useTable` 把「筛选模型 → 请求参数 → url」这条链路收在一起，顺序由内部保证（模型先于首次请求存在、`formSchemes` 在 `computed` 里求值、重查回调等表格挂载之后再注册）：

- `formSchemes`：筛选表单的方案，推荐写成工厂 `(model) => [...]` —— 工厂里能拿到筛选模型，读到的响应式值也会被收集；各项的 `modelValue` 同时就是该字段的初值（与 `FormQuery` 的 `schemes` 约定一致）；
- `urlFields`：声明哪些筛选字段与 url **双向同步**（**不叫 `fields`**，因为 `fields` 在 cosey 里已经分别指表单暴露的 `FormItemContext[]`、导出时的列 prop，而同一个 `useTable` 的返回值上还有 `getFieldsValue()` —— 那是查询表单的**全部**字段值）；
- 第二个返回值上的 `model`：表格之外也能直接读写筛选条件。

::: demo

table/query

:::

带条件跳转时，接收页声明 `urlFields`，url 上的条件会在**第一次请求之前**落到模型（而不是先拉全量再补一次）：

```ts
const [tableProps] = useTable<CommentQuery>({
  api: getComments,
  columns: [...],
  // 初值写在各项的 modelValue 上
  formSchemes: (model) => [
    { prop: 'content', label: '评论内容', modelValue: '' },
    // url 上是 ?postId=18，模型里的字段也叫 postId
    pinnedSelectScheme({ prop: 'postId', label: '所属文章', select: postSelectConfig, model }),
  ],
  urlFields: { postId: parseNumber },
});
```

跳转方用 `compactQuery` 拼 url，没有值的字段不会留下 `?postId=`：

```ts
router.push({ path: '/blog/comments', query: compactQuery({ postId: row.id }) });
```

url 参数名与模型字段名不一致时用 `param` 声明（给数组表示兼容多个别名）：

```ts
urlFields: {
  postTypeId: { param: 'type', parse: parseNumber },
}
```

关联字段用 `pinnedSelectScheme` 而不是直接写 `fieldProps`：`co-remote-select` 只在**挂载时**按 `immediate` 拉一次数据来解析当前值的标签，而 url 变化时组件不会重建，标签会退化成裸 id（例如显示 `17`）。它给 scheme 挂了一个以当前值为内容的 `key`，值一变就重建 form-item，重新解析出标签。

### 批量操作条

开启 `batch` 后，勾选任意行会在表格上方出现一条操作栏，内容由 `#batch` 插槽提供，插槽参数里有 `count` / `rows` / `clear`。

选中态不在表格里时（例如 [表格选择器](./table-select) 自己维护选中集），用 `batch.rows` 把数据交过去，操作栏就只看这份数据，不再依赖勾选列。

::: demo

table/batch

:::

### 行内编辑

给列加 `editable` 即把该单元格换成 `co-field`，值变化会直接写回 `row[prop]`，同时触发 `cell-change`。默认点击单元格不触发行选中，可用 `editable.stopPropagation: false` 关掉。

::: demo

table/editable

:::

### 行拖拽

开启 `row-draggable` 后可以拖动行调整顺序，本地数据会立即重排，并抛出 `row-move`（`{ from, to, rows }`）。顺序要持久化时，记得在事件里提交给服务端。

落点以行的中线为界：拖到上半部分插到该行之前，下半部分插到该行之后。高亮线（行上边框 / 下边框）画的就是真实的插入位置，拖到最后一行下半部分时线在表格底部。

::: demo

table/row-drag

:::

> 拖拽只对普通表格生效。树形数据、`el-table-v2` 这类行数与数据条数不一致的场景会自动失效。

### 列配置持久化

传 `table-key` 后，「列设置」里调整的顺序与显隐会记在本地存储里，刷新或下次进入同一表格时自动恢复；点「恢复默认」会清掉记录。

```vue
<co-table table-key="user-list" :columns="columns" />
```

## API

### useTable

`useTable(options)` 配置表格属性，返回 `[tableProps, expose]`：表格属性直接 `v-bind` 给 `co-table`，组件方法与筛选模型在第二个元素上。

`options` 可以是对象，也可以是 getter / `computed` —— 后者让整份属性跟随响应式数据重算（例如列里用到 `t()`、权限码）：

```ts
const [tableProps, { reload }] = useTable(() => ({
  api: getRoles,
  columns: [{ prop: 'name', label: t('rbac.roleName') }],
}));
```

| 属性          | 描述                                                                                                      | 类型                                                                       | 默认值   |
| ------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------- |
| api           | 请求数据的函数                                                                                            | (...args: any[]) => Promise\<any>                                          | -        |
| columns       | 定义表格列；传函数可跟随响应式数据重算                                                                    | MaybeRefOrGetter\<[TableColumnProps](#tablecolumnprops)[]>                 | []       |
| actionColumn  | 定义表格操作列                                                                                            | MaybeRefOrGetter\<[TableColumnProps](#tablecolumnprops)>                   | -        |
| formSchemes   | 筛选表单的方案；各项的 `modelValue` 即该字段初值                                                          | [TableSchemes](#tableschemes)                                              | -        |
| urlFields     | 与 url 双向同步的筛选字段                                                                                 | Partial\<Record\<keyof T & string, [QueryFieldConfig](#queryfieldconfig)>> | -        |
| onQueryChange | url 上的筛选条件变化后怎么重查：`'submit'` 回到第 1 页、`'reload'` 保留当前页                             | `'submit' \| 'reload'`                                                     | 'submit' |
| formProps     | 查询表单的其它配置；`model` / `resetValues` 由内部接管，`schemes` 也可写在这里（顶层 `formSchemes` 优先） | [FormQueryProps](./form-query#formqueryprops)                              | -        |
| 其它          | 透传给 `co-table`，如 `pagination` / `toolbarConfig` / `height`                                           | -                                                                          | -        |

返回 `UseTableResult`（元组）：

| 位置 | 属性        | 描述                                                                       | 类型                        |
| ---- | ----------- | -------------------------------------------------------------------------- | --------------------------- |
| 0    | tableProps  | 表格属性，`v-bind` 给 `co-table`                                           | ComputedRef\<TableProps>    |
| 1    | model       | 筛选模型                                                                   | T                           |
| 1    | queryFilter | url 同步能力（`fieldKeys` / `queryParams` / `onChange`）                   | [QueryFilter](#queryfilter) |
| 1    | 其它        | 展开 [TableExpose](#tableexpose)，如 `reload` / `submit` / `getPagination` | TableExpose                 |

> 兼容：`formProps.model` 仍可传入，此时模型由调用方提供（必须是 `reactive` 对象），
> 同名 `formSchemes` 项的 `modelValue` 不再生效；正常用法不需要传，控制台会给出提示。

### TableSchemes

```ts
type TableSchemes<T> =
  | FormQueryScheme[] // 静态
  | MaybeRefOrGetter<FormQueryScheme[]> // 跟随响应式数据
  | ((model: T) => FormQueryScheme[]); // 推荐：能拿到筛选模型
```

### QueryFieldConfig

```ts
type QueryFieldConfig<T = any> =
  | ((value: RawQueryValue) => T | undefined) // 解析函数
  | {
      parse?: (value: RawQueryValue) => T | undefined; // url → 模型
      format?: (value: T) => QueryInput; // 模型 → url
      param?: string | string[]; // url 参数名，数组表示兼容多个别名
    };
```

内置解析器：`parseNumber`、`parseString`、`parseStringArray`。

### QueryFilter

| 属性        | 描述                                                      | 类型                                            |
| ----------- | --------------------------------------------------------- | ----------------------------------------------- |
| fieldKeys   | 受 url 管辖的字段名（模型字段名）                         | (keyof T & string)[]                            |
| queryParams | 模型字段名 → url 主参数名                                 | Partial\<Record\<keyof T & string, string>>     |
| onChange    | 注册「url 上的条件变了」之后的回调，通常传表格的 `submit` | (handler: () => void \| Promise\<void>) => void |
| resetValues | 交给 `formProps.resetValues`，点「重置」时连 url 一起清空 | () => Record\<string, undefined>                |

### pinnedSelectScheme

生成关联筛选字段的 scheme，让「当前值不在选项里」时也能正确显示标签。

| 属性   | 描述                         | 类型                                     |
| ------ | ---------------------------- | ---------------------------------------- |
| prop   | 字段名，同时是筛选模型的 key | string                                   |
| label  | 筛选栏里的标签               | string                                   |
| select | 远程选择器配置               | object（含 `api` / `props` / `keys` 等） |
| model  | 筛选模型                     | object                                   |

### withPinnedValue

给远程选择器配置包一层：挂载即加载一次，当前值不在结果里就单独取回来置顶。

| 参数           | 描述                       | 类型                                                   |
| -------------- | -------------------------- | ------------------------------------------------------ |
| config         | 远程选择器配置             | object                                                 |
| getPinnedValue | 读取当前值，支持数组       | () => string \| number \| (string \| number)[] \| null |
| options        | `valueKey` / `matchParams` | object                                                 |

### TableProps

继承 `element-plus` 的 [Table 属性](https://element-plus.org/zh-CN/component/table#table-%E5%B1%9E%E6%80%A7) 并有以下属性：

| 属性               | 描述                                                                        | 类型                                                                                                 | 默认值                     |
| ------------------ | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------- |
| api                | 请求数据的函数                                                              | (...args: any[]) => Promise\<any>                                                                    | -                          |
| immediate          | 是否在挂载后立即请求数据                                                    | boolean                                                                                              | true                       |
| columns            | 定义表格列                                                                  | [TableColumnProps](#tablecolumnprops)[]                                                              | []                         |
| action-column      | 定义表格操作列                                                              | [TableColumnProps](#tablecolumnprops)                                                                | -                          |
| pagination         | 设置分页属性或隐藏分页组件                                                  | boolean \| [PaginationProps](https://element-plus.org/zh-CN/component/pagination#%E5%B1%9E%E6%80%A7) | true                       |
| get-expose         | 获取 `TableExpose`，会在组件创建后调用                                      | (expose: TableExpose) => void                                                                        | -                          |
| form-props         | 自定义查询表单属性                                                          | [FormQueryProps](./form-query#formqueryprops)                                                        | -                          |
| transform-params   | 请求之前对参数进行处理                                                      | (params: Record<string, any>) => any                                                                 | -                          |
| transform-response | 请求之后对返回值进行处理                                                    | (res: any) => any                                                                                    | -                          |
| parallel-fetch     | 会和 `api` 同时请求，并接收相同的参数，并影响加载状态。常用于获取统计数据。 | (...args: any[]) => Promise\<any> \| any                                                             | -                          |
| toolbar-config     | 设置工具栏按钮；不传时继承全局 `TableConfig['toolbarConfig']`               | [ToolbarConfig](#toolbarconfig) \| boolean                                                           | true                       |
| keys               | 定义接口相关的键名                                                          | [TableConfig](#tableconfig)['keys']                                                                  | defaultTableConfig['keys'] |
| stats-columns      | 定义统计列                                                                  | MaybeRef\<[TableStatisticsColumn](#tablestatisticscolumn)[]>                                         | -                          |
| stats-data         | 统计数据                                                                    | MaybeRef\<Record<string, any>>                                                                       | -                          |
| summary-properties | 设置默认合计时仅展示指定列数据                                              | string[]                                                                                             | -                          |
| transform-summary  | 转换合计列数据                                                              | (sums: any[]) => any[]                                                                               | -                          |
| split              | 分隔表格主体和头部等，显示分隔条                                            | boolean                                                                                              | false                      |
| table-key          | 表格标识，设置后列顺序/显隐会持久化到本地存储                               | string                                                                                               | -                          |
| batch              | 批量操作条，选中行后显示；内容由 `#batch` 插槽提供                          | boolean \| { text?: string; rows?: any[] }                                                           | false                      |
| row-draggable      | 行拖拽排序                                                                  | boolean                                                                                              | false                      |

### TableConfig

供 [ConfigProvider](./config-provider) 的 `table` 属性使用，设置表格的全局默认值。

```ts
interface TableConfig {
  keys?: {
    list?: string;
    total?: string;
    page?: string;
    pageSize?: string;
    orderBy?: string;
    orderType?: string;
    asc?: string;
    desc?: string;
  };
  pagination?: Partial<PaginationProps>;
  toolbarConfig?: ToolbarConfig | boolean;
  height?: number | string;
  split?: boolean;
}
```

`toolbarConfig` 与表格上的 `toolbar-config` 逐项合并，优先级为 **默认值 → 全局 → 表格**：

```vue
<!-- 全局隐藏导出和全屏按钮 -->
<ConfigProvider :table="{ toolbarConfig: { export: false, fullScreen: false } }">
  <!-- 继承全局：只剩刷新和列设置 -->
  <co-table :columns="columns" :api="listApi" />
  <!-- 某张表仍要导出：局部覆盖 -->
  <co-table :columns="columns" :api="listApi" :toolbar-config="{ export: true }" />
  <!-- 整条工具栏关掉 -->
  <co-table :columns="columns" :api="listApi" :toolbar-config="false" />
</ConfigProvider>
```

全局设为 `false` 时所有表格默认不显示工具栏，单张表格传 `true` 或对象即可打开。

### defaultTableConfig

```ts
const defaultTableConfig = {
  keys: {
    /**
     * 响应数据对象中“列表数据”的 key
     */
    list: 'list',

    /**
     * 响应数据对象中“总记录数”的 key
     */
    total: 'total',

    /**
     * 请求url查询参数中“当前页数”的参数名
     */
    page: 'page',

    /**
     * 请求url查询参数中“每页条数”的参数名
     */
    pageSize: 'pageSize',

    /**
     * 请求url查询参数中“排序列”的参数名
     */
    orderBy: 'orderBy',

    /**
     * 请求url查询参数中“排序方向”的参数名
     */
    orderType: 'orderType',

    /**
     * 排序方向中“升序”的值
     */
    asc: 'asc',

    /**
     * 排序方向中“降序”的值
     */
    desc: 'desc',
  },
  pagination: {
    layout: 'prev, pager, next, sizes, jumper, total',
    currentPage: 1,
    pageSize: 10,
  },
  toolbarConfig: true,
  height: undefined,
  split: false,
};
```

### ToolbarConfig

| 属性       | 描述                                     | 类型                            | 默认值 |
| ---------- | ---------------------------------------- | ------------------------------- | ------ |
| reload     | 是否显示重载按钮                         | boolean                         | true   |
| export     | 是否显示导出按钮，传对象可指定导出文件名 | boolean \| { filename: string } | true   |
| fullScreen | 是否显示全屏按钮                         | boolean                         | true   |
| setting    | 是否显示列设置按钮                       | boolean                         | true   |

### TableStatisticsColumn

| 属性   | 描述                        | 类型                |
| ------ | --------------------------- | ------------------- |
| label  | 显示的标题                  | VNodeChild          |
| prop   | 字段名称 对应列内容的字段名 | string              |
| format | 用来格式化内容              | (value: any) => any |

### TableSlots

继承 `element-plus` 的 [Table 插槽](https://element-plus.org/zh-CN/component/table#table-%E6%8F%92%E6%A7%BD) 和以下插槽，并能定义 `TableColumnProps["slots"]` 中同名的插槽。

| 插槽               | 描述                                           | 属性                                              |
| ------------------ | ---------------------------------------------- | ------------------------------------------------- |
| toolbar-left       | 自定义工具栏左边的内容                         | -                                                 |
| toolbar-right      | 自定义工具栏右边的内容                         | -                                                 |
| before-body        | 自定义主体前面内容（工具栏上面）               | -                                                 |
| before-body-plain  | 自定义主体前面内容（工具栏上面），没有包裹容器 | -                                                 |
| before-table       | 自定义表格前面内容（工具栏下面）               | -                                                 |
| before-table-plain | 自定义表格前面内容（工具栏下面），没有包裹容器 | -                                                 |
| batch              | 批量操作条的内容                               | { count: number; rows: any[]; clear: () => void } |

### TableEmits

继承 `element-plus` 的 [Table 事件](https://element-plus.org/zh-CN/component/table#table-%E4%BA%8B%E4%BB%B6)，并在 `row-draggable` 开启时提供：

| 事件        | 描述                       | 类型                                                            |
| ----------- | -------------------------- | --------------------------------------------------------------- |
| row-move    | 行拖拽结束后触发           | ({ from: number; to: number; rows: any[] }) => void             |
| cell-change | 行内编辑的值发生变化时触发 | ({ row: any; prop: string; value: any; index: number }) => void |

### TableExpose

继承 `element-plus` 的 [Table Exposes](https://element-plus.org/zh-CN/component/table#table-exposes) ，以及 [FormQueryExpose](./form-query#formqueryprops)，并支持以下属性。

| 属性               | 描述                           | 类型                                                  |
| ------------------ | ------------------------------ | ----------------------------------------------------- |
| reload             | 刷新表格数据                   | () => Promise\<void>                                  |
| expandAll          | 展开所有                       | () => void                                            |
| collapseAll        | 折叠所有                       | () => void                                            |
| getFetchParams     | 获取接口请求参数               | () => Record<string, any>                             |
| getFullFetchParams | 获取接口所有请求参数，包括分页 | () => Record<string, any>                             |
| setData            | 设置表格数据                   | (data: any[]) => void                                 |
| getData            | 获取表格数据                   | () => any[]                                           |
| getRootEl          | 获取根元素                     | () => HTMLElement \| null                             |
| getPagination      | 获取分页数据                   | () => \{ page: number; pageSize: number; }            |
| reset              | 重置表单                       | (values?: Record<PropertyKey, any>) => Promise\<void> |

### TableColumnProps

继承 `element-plus` 的 [Table-column 属性](https://element-plus.org/zh-CN/component/table#table-column-%E5%B1%9E%E6%80%A7)，并支持以下属性。

| 属性     | 描述                                        | 类型                                                                                       | 默认值 |
| -------- | ------------------------------------------- | ------------------------------------------------------------------------------------------ | ------ |
| slots    | 定义插槽或声明插槽名称                      | TableColumnPropsSlots                                                                      | -      |
| renderer | 使用内置渲染器进行渲染                      | RendererType                                                                               | 'text' |
| hidden   | 是否隐藏当前列                              | boolean                                                                                    | false  |
| columns  | 定义嵌套的表格列                            | TableColumnProps[]                                                                         | -      |
| tooltip  | 设置列头提示框                              | string                                                                                     | -      |
| format   | 格式化数据                                  | (cellValue: any, row: any, column: TableColumnCtx\<any>, index: number) => VNode \| string | -      |
| actions  | 操作按钮，与 `slots` 同时存在时以它为准     | [TableColumnActions](#tablecolumnactions)                                                  | -      |
| divider  | 操作按钮之间的分割线，仅在 `actions` 下生效 | boolean                                                                                    | -      |
| editable | 行内编辑，传 `true` 使用默认输入框          | boolean \| [TableColumnEditable](#tablecolumneditable)                                     | -      |

### TableColumnEditable

```ts
interface TableColumnEditable {
  /** 编辑器类型，默认 input，可选值同 co-field 的 type */
  type?: FieldType;
  /** 传给编辑器的属性，不要传 modelValue */
  props?: Record<string, any>;
  /** 点击编辑器时阻止行点击/选中，默认 true */
  stopPropagation?: boolean;
  /** 值变化回调；不传时直接写回 row[prop] */
  onChange?: (value: any, row: any, index: number) => void;
}
```

### TableColumnActions

```ts
type TableColumnActions =
  | TableActionProps['actions'] // 数组：直接渲染
  | ((row: any, $index: number) => TableActionProps['actions']); // 工厂：推荐，可按行决定
```

工厂在每次渲染时求值，因此 `visible` / `onClick` / `popconfirm` 里都能用当前行，读到的响应式值也会跟着更新。

### TableColumnPropsSlots

当值设置为非对象时，表示设置默认插槽。各个插槽的值可以是字符串或函数，如果是字符串，则从 `TableSlots` 中匹配对应的插槽内容。

```ts
type TableColumnPropsSlots =
  | string
  | ((props: { row: any; column: any; $index: number }) => any)
  | {
      default?: string | ((props: { row: any; column: any; $index: number }) => any);
      header?: string | ((props: { column: any; $index: number }) => any);
      filterIcon?: string | ((props: { filterOpened: boolean }) => any);
    };
```

### RendererType

每个值都包含“字符串”和“对象”类型，对象类型用于自定义配置，例如：

```ts
{
  renderer: 'longtext';
}
```

```ts
{
  renderer: {
    type: 'longtext',
    props: {
      rows: 2
    }
  }
}
```

#### text

原样输出文本。

#### date

格式化为 `YYYY-MM-DD`。

#### datetime

格式化为 `YYYY-MM-DD HH:mm:ss`。

#### media

使用 [MediaCard](./media-card) 组件渲染。

| 参数  | 描述                 | 类型                                          |
| ----- | -------------------- | --------------------------------------------- |
| props | 自定义组件的 `props` | [MediaCardProps](./media-card#mediacardprops) |

#### mediagroup

使用 [MediaCardGroup](./media-card-group) 组件渲染。

| 参数  | 描述                 | 类型                                                          |
| ----- | -------------------- | ------------------------------------------------------------- |
| props | 自定义组件的 `props` | [MediaCardGroupProps](./media-card-group#mediacardgroupprops) |

#### tag

使用 [ElTag](https://element-plus.org/zh-CN/component/tag) 组件渲染。

| 参数  | 描述                                    | 类型                                                                      |
| ----- | --------------------------------------- | ------------------------------------------------------------------------- |
| path  | 使用 `lodash` 的 `get` 函数获取嵌套数据 | string \| string[]                                                        |
| props | 自定义组件的 `props`                    | [ElTagProps](https://element-plus.org/zh-CN/component/tag#tag-attributes) |

#### longtext

使用 [LongText](./long-text) 组件渲染。

| 参数  | 描述                 | 类型                                       |
| ----- | -------------------- | ------------------------------------------ |
| props | 自定义组件的 `props` | [LongTextProps](./long-text#longtextprops) |

#### switch

使用 [ElSwitch](https://element-plus.org/zh-CN/component/switch) 组件渲染。

| 参数  | 描述                 | 类型                                                                      |
| ----- | -------------------- | ------------------------------------------------------------------------- |
| api   | 更新数据接口         | (value: any, row: any) => Promise\<any>                                   |
| props | 自定义组件的 `props` | [SwitchProps](https://element-plus.org/zh-CN/component/switch#attributes) |

#### click

使用 [ElLink](https://element-plus.org/zh-CN/component/link) 组件渲染。

| 参数    | 描述                 | 类型                                                                                     |
| ------- | -------------------- | ---------------------------------------------------------------------------------------- |
| props   | 自定义组件的 `props` | [LinkProps](https://element-plus.org/zh-CN/component/link#attributes)                    |
| format  | 格式化内容           | [TableColumnProps](#tablecolumnprops)['format']                                          |
| onClick | 点击时的回调         | (params: { row: any; value: any; index: number; column: TableColumnCtx\<any>; }) => void |

### TableActionProps

| 属性    | 描述           | 类型                                             | 默认值 |
| ------- | -------------- | ------------------------------------------------ | ------ |
| actions | 定义操作按钮   | TableActionItemAtom[] \| TableActionItemAtom[][] | []     |
| divider | 是否显示分割线 | boolean                                          | true   |

### TableActionItemAtom

```ts
type TableActionItemAtom =
  | TableActionItemProps
  | null
  | undefined
  | boolean
  | TableActionItemAtom[];
```

### TableActionItemProps

继承 `element-plus` 的 [Button Attributes](https://element-plus.org/zh-CN/component/button#button-attributes) 并有以下属性：

| 属性       | 描述           | 类型                                                                                                                                                                 | 默认值 |
| ---------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| label      | 按钮内容       | string                                                                                                                                                               | -      |
| popconfirm | 定义气泡确认框 | [PopconfirmProps](https://element-plus.org/zh-CN/component/popconfirm#attributes) & \{ confirm?: (event: MouseEvent) => any; cancel?: (event: MouseEvent) => void; } | -      |
| onClick    | 点击按钮时出发 | (event: MouseEvent) => void                                                                                                                                          | -      |
| visible    | 是否显示按钮   | boolean                                                                                                                                                              | true   |
| icon       | 按钮前面的icon | [IconProps](./icon#iconprops)['name']                                                                                                                                | -      |

### TableActionConfig

```ts
interface TableActionConfig {
  itemProps?: TableActionItemProps;
}
```
