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

## API

### RemoteSelectProps

继承 `element-plus` 的 [Select Attributes](https://element-plus.org/zh-CN/component/select#select-attributes)，并添加以下属性：

| 属性             | 描述                                       | 类型                                                                                                       | 默认值 |
| ---------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ------ |
| option-props     | 自定义 `ElOption` 的属性                   | Record<PropertyKey, any> \| ((props: Record<PropertyKey, any>, index: number) => Record<PropertyKey, any>) | -      |
| api              | 获取列表数据的接口                         | (...args: any[]) => Promise\<any> \| any                                                                   | -      |
| pagination       | 自定义分页属性，或者设置 `false` 隐藏分页  | boolean \| [PaginationProps](https://element-plus.org/zh-CN/component/pagination#%E5%B1%9E%E6%80%A7)       | true   |
| form-props       | 自定义筛选表单属性                         | [FormQueryProps](./form-query#formqueryprops)                                                              | -      |
| transform-params | 转换当前请求参数                           | (params: Record<string, any>) => any                                                                       | -      |
| keys             | 定义接口相关的键名                         | [TableConfig](./table#tableconfig)['keys']                                                                 | -      |
| immediate        | 是否立即请求数据，还是在下拉框显示时才请求 | boolean                                                                                                    | false  |

### RemoteSelectSlots

继承 `element-plus` 的 [Select Slots](https://element-plus.org/zh-CN/component/select#select-slots) ，并添加以下插槽：

| 插槽   | 描述                   | 属性                                                 |
| ------ | ---------------------- | ---------------------------------------------------- |
| option | 自定义 `ElOption` 内容 | { option: Record\<PropertyKey, any>; index: number } |

### RemoteSelectEmits

继承 `element-plus` 的 [Select Events](https://element-plus.org/zh-CN/component/select#select-events)。
