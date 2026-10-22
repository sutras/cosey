# TableSelect 表格选择器

## 简介

点击后打开弹窗，在表格里选择数据，确认后回填到输入框。

弹窗里的表格就是 `co-table`：`api`、`columns`、`form-props`、`keys`、`pagination` 与表格完全一致，筛选、分页、列配置都可以直接使用。

适合选项需要多列信息才能辨认、或者需要多个条件才能筛出目标的场景。

## 代码演示

### 基础使用（单选）

`api` 用于获取数据，`props` 指定每一行的文本字段与值字段，`columns` 定义表格列。

示例数据来自 mock 的 `/mock/api/products` 接口，字段与商品模型一致。

已经在 `model-value` 里、但不在当前列表中的值，用 `fetch-selected` 查出对应的行，否则输入框里只能显示原始值。

::: demo

table-select/basic

:::

### 多选

设置 `multiple` 后，行首变成复选框，表头的复选框作用于当前页。

弹窗内的选择是临时的，点「确定」才会写回 `model-value`。选中后表格上方出现批量操作条，显示已选数量与清空操作，`batch` 插槽可以往里面加自己的操作。超过 `max-tag-count` 的标签折叠成 `+N`，标签上的叉可以单独移除一项。

::: demo

table-select/multiple

:::

### 抽屉与尺寸

设置 `drawer` 用抽屉代替弹窗，`width` 控制尺寸；`dialog-props`、`drawer-props` 透传给对应的弹层组件。`size` 控制输入框尺寸，不传时跟随所在的 `co-form-item`。

::: demo

table-select/size

:::

### 表单校验

放在 `co-form-item` 里时，选择或清空都会触发表单校验，表现与内置表单控件一致。

::: demo

table-select/validate

:::

## API

### TableSelectProps

| 属性             | 描述                                                                | 类型                                                                      | 默认值 |
| ---------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------ |
| model-value      | 选中的值，多选时为数组                                              | any                                                                       | -      |
| multiple         | 是否多选                                                            | boolean                                                                   | false  |
| api              | 获取列表数据的接口                                                  | (...args: any[]) => Promise\<any> \| any                                  | -      |
| columns          | 表格列，同 `co-table`                                               | [TableColumnProps](./table#tablecolumnprops)[]                            | []     |
| table-props      | 透传给 `co-table` 的其他属性                                        | [TableProps](./table#tableprops)                                          | -      |
| form-props       | 筛选表单属性                                                        | [FormQueryProps](./form-query#formqueryprops)                             | -      |
| transform-params | 转换当前请求参数                                                    | (params: Record<string, any>) => any                                      | -      |
| keys             | 定义接口相关的键名                                                  | [TableConfig](./table#tableconfig)['keys']                                | -      |
| pagination       | 自定义分页属性，或者设置 `false` 隐藏分页                           | boolean \| PaginationProps                                                | true   |
| props            | 指定每一行的文本字段与值字段，形如 `{ label: 'name', value: 'id' }` | { label?: string; value?: string }                                        | -      |
| placeholder      | 未选中时的提示，同时作为弹窗的默认标题                              | string                                                                    | 请选择 |
| size             | 输入框尺寸，不传时跟随所在的 `co-form-item`                         | 'small' \| 'default' \| 'large'                                           | -      |
| disabled         | 是否禁用                                                            | boolean                                                                   | false  |
| clearable        | 是否可清空，悬停或聚焦时清空按钮顶替箭头                            | boolean                                                                   | true   |
| max-tag-count    | 多选时最多显示几个标签，其余折叠为 `+N`                             | number                                                                    | 2      |
| title            | 弹窗标题                                                            | string                                                                    | -      |
| width            | 弹窗宽度                                                            | string \| number                                                          | 900    |
| drawer           | 是否使用抽屉代替弹窗                                                | boolean                                                                   | false  |
| dialog-props     | 透传给 `ElDialog` 的属性                                            | [DialogProps](https://element-plus.org/zh-CN/component/dialog#attributes) | -      |
| drawer-props     | 透传给 `ElDrawer` 的属性                                            | [DrawerProps](https://element-plus.org/zh-CN/component/drawer#attributes) | -      |
| fetch-selected   | 根据值查出对应的行，用于回显                                        | (values: any[]) => Promise\<any[]> \| any[]                               | -      |
| row-key          | 行唯一标识字段，默认为 `props.value`                                | string \| ((row: any) => any)                                             | -      |

### TableSelectSlots

| 插槽  | 描述                                       | 属性                                              |
| ----- | ------------------------------------------ | ------------------------------------------------- |
| tag   | 自定义多选时标签的内容                     | { row: any; index: number }                       |
| label | 自定义单选时输入框里的内容                 | { row: any }                                      |
| batch | 批量操作条右侧的操作，紧挨着默认的「清空」 | { rows: any[]; count: number; clear: () => void } |

### TableSelectEmits

| 事件              | 描述                 | 参数                      |
| ----------------- | -------------------- | ------------------------- |
| update:modelValue | 选中的值变化         | (value: any)              |
| change            | 选中的值变化         | (value: any, rows: any[]) |
| confirm           | 点「确定」时触发     | (value: any, rows: any[]) |
| cancel            | 点「取消」时触发     | -                         |
| clear             | 点清空按钮时触发     | -                         |
| visible-change    | 弹窗打开或关闭时触发 | (visible: boolean)        |

> 表格的事件通过 `table-props` 传递，例如 `table-props="{ onRowDblclick: handler }"`；弹层首次打开时才创建，关闭即销毁，再次打开会重新请求数据。
