# RemoteSelect 远程选择器

## 简介

`ElSelect` 的远程版本，通过传递的接口和配置获取数据，并且组合了分页组件和查询表单组件，其功能相当于一个小型表格组件。

## 代码演示

### 基础使用

设置 `api` 属性用于获取数据，设置 `props` 属性绑定下拉菜单的 `label` 和 `value`。

可选的 `form-props` 属性用于配置查询表单。

默认下拉菜单只显示 `label`，如果要显示更多内容，可以使用 `option` 插槽，其 `option` 属性对应着表格的每一行数据。

::: demo

remote-select/basic

:::

### 输入即搜索

设置 `searchable` 后，下拉框的输入框直接连接接口：输入内容经防抖后作为参数请求数据，默认参数名为 `keyword`，可用 `search-param` 修改，也可传入函数自行组装参数。

开启后会同时打开 `filterable`，此时不会再对当前页做本地过滤。

::: demo

remote-select/search

:::

### 触底加载

设置 `pagination="scroll"` 换掉页码分页：滚到列表底部自动请求下一页，结果追加在列表末尾，底部那行显示加载状态。列表不满一屏、滚不动时可以直接点它翻页。

可以和 `searchable` 一起用：输入关键字会重新从第 1 页查，之后的滚动接着往后追加。

`pagination` 传 `true` 或对象仍是页码分页（对象透传给 `ElPagination`），传 `false` 则不分页。

::: demo

remote-select/scroll

:::

### 多选

多选模式下跨页连续选择时，已经选中但不在当前页的选项会固定显示在列表顶部，并以分割线隔开。

示例开启了 `searchable`，搜索和跨页选择可以混着用：搜索后选中的项同样会被固定在顶部，清空关键字就回到完整列表。

::: demo

remote-select/multiple

:::

## API

### RemoteSelectProps

继承 `element-plus` 的 [Select Attributes](https://element-plus.org/zh-CN/component/select#select-attributes)，并添加以下属性：

| 属性             | 描述                                                                                                  | 类型                                                                                                             | 默认值  |
| ---------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------- |
| option-props     | 自定义 `ElOption` 的属性                                                                              | Record<PropertyKey, any> \| ((props: Record<PropertyKey, any>, index: number) => Record<PropertyKey, any>)       | -       |
| api              | 获取列表数据的接口                                                                                    | (...args: any[]) => Promise\<any> \| any                                                                         | -       |
| pagination       | 分页方式：`true` / 对象为页码分页（对象透传给 `ElPagination`），`'scroll'` 为触底加载，`false` 不分页 | boolean \| 'scroll' \| [PaginationProps](https://element-plus.org/zh-CN/component/pagination#%E5%B1%9E%E6%80%A7) | true    |
| form-props       | 自定义筛选表单属性                                                                                    | [FormQueryProps](./form-query#formqueryprops)                                                                    | -       |
| transform-params | 转换当前请求参数                                                                                      | (params: Record<string, any>) => any                                                                             | -       |
| keys             | 定义接口相关的键名                                                                                    | [TableConfig](./table#tableconfig)['keys']                                                                       | -       |
| immediate        | 是否立即请求数据，还是在下拉框显示时才请求                                                            | boolean                                                                                                          | false   |
| searchable       | 是否把输入框的输入作为请求参数                                                                        | boolean                                                                                                          | false   |
| search-param     | 关键字对应的参数名，传入函数时以返回值作为参数                                                        | string \| ((keyword: string) => Record<string, any>)                                                             | keyword |
| search-debounce  | 输入搜索的防抖时间（毫秒）                                                                            | number                                                                                                           | 300     |

> 传入 `option` 插槽时，固定显示在顶部的已选项其 `index` 为 `-1`。

### RemoteSelectSlots

继承 `element-plus` 的 [Select Slots](https://element-plus.org/zh-CN/component/select#select-slots) ，并添加以下插槽：

| 插槽   | 描述                   | 属性                                                 |
| ------ | ---------------------- | ---------------------------------------------------- |
| option | 自定义 `ElOption` 内容 | { option: Record\<PropertyKey, any>; index: number } |

### RemoteSelectEmits

继承 `element-plus` 的 [Select Events](https://element-plus.org/zh-CN/component/select#select-events)，并添加以下事件：

| 事件   | 描述                 | 参数              |
| ------ | -------------------- | ----------------- |
| search | 搜索关键字变化后触发 | (keyword: string) |
