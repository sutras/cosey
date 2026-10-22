# FormQuery 查询表单

## 简介

`FormQuery` 是预设了栅格布局的 `Form` 组件，拥有相同的接口，并添加了折叠功能，通常和表格组件一起使用。

字段有两种写法，可以混用：

- **插槽**：手写 `<co-form-item v-model="...">`，适合结构自由、联动复杂的场景；
- **声明式**：传 `schemes` 数组，每项就是一份 `FormItem` 属性，值统一落到 `model` 上。

不传 `model` 时组件会自己维护一个模型，用 `getFieldsValue()` / `setFieldsValue()` 读写——
查询栏、弹窗里的筛选条都可以直接用它，不需要额外的容器组件。

## 代码演示

### 基础演示

::: demo

form-query/basic

:::

### 声明式字段

`schemes` 里的每一项都是一份 `FormItem` 的属性，`modelValue` 即该字段初值。
需要完全自定义控件时，用 `render({ model })` 返回自己的内容。

不能给 `FormItem` 用的属性（比如 `render`）会被剔除，`slots` 会原样传给 `FormItem`。
输入框里按 Enter 就会提交（`submit-on-enter` 默认开启，普通表单不需要时传 `false`）。

::: demo

form-query/schemes

:::

### 行内筛选条

关掉栅格（`:grid="false"`）并开启 `inline`，就是表格头部、下拉弹层里那种一行排开的筛选条。

这种排布没有列宽托底，控件会被压到输入框的固有宽度（`状态` 这种窄控件甚至会被挤成一条），
所以非栅格 + `inline` 时 `min-width` 默认取 `200`：空间不够就整项换行，而不是继续挤。
需要别的下限就显式传 `min-width`；显式传了 `width` 则不再兜这个默认值。

::: demo

form-query/inline

:::

非栅格没有「列」的概念，「显示一行」无从计算，所以收起数量只能由 `min-fields` 显式给出：
传正数就按该数量折叠，并出现展开/收起按钮；默认 `-1` 时不隐藏任何字段、也没有按钮。

::: demo

form-query/inline-collapse

:::

### 默认展开

使用 `collapsed` 属性设置折叠状态，也可以用 `v-model:collapsed` 双向绑定。

::: demo

form-query/expand

:::

### 最小显示表单项数

默认在折叠状态下会显示一行的表单控件，通过 `min-fields` 属性可以设置折叠时显示的固定数量的表单控件。

非栅格模式（`:grid="false"`）没有「行」的概念，只有传正数时才会折叠。

::: demo

form-query/min-fields

:::

### 隐藏折叠按钮

设置 `:min-fields="0"` 可以隐藏折叠按钮。

::: demo

form-query/hide-toggle

:::

### 垂直排布

设置 `label-position="top"` 实现垂直排布，可以使表单控件有更多的展示空间。

::: demo

form-query/vertical

:::

### 校验失败自动展开

收起状态下被隐藏的字段**仍然参与校验**（`FormItem` 只是被设成 `display: none`），
出错却完全看不见 —— 用户会以为「点了查询没反应」。所以校验失败时表单会自动展开。

::: demo

form-query/invalid

:::

## API

### FormQueryProps

继承 [FormProps](./form#formprops)，并有以下额外属性或默认值。

| 属性              | 描述                                                                                                                                                          | 类型                      | 默认值                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ---------------------------------------- |
| grid              | 是否开启栅格化模式                                                                                                                                            | boolean                   | true                                     |
| col-props         | 栅格化模式下设置所有 `field` 共同的 `Col` 的属性                                                                                                              | ColProps                  | \{ xs: 24, sm: 12, md: 8, lg: 6, xl: 6 } |
| min-width         | 控件区的最小宽度，非栅格 + `inline` 时默认 200                                                                                                                | FormItemWidth             | -                                        |
| min-fields        | 自定义折叠状态下默认显示的表单控件数量，小于 0，则显示一行控件（非栅格模式下不算「行」，不折叠）； 等于 0，则显示所有控件；数量大于等于控件数量则隐藏展开按钮 | number                    | -1                                       |
| collapsed         | 是否折叠超出的表单项                                                                                                                                          | boolean                   | true                                     |
| reset-values      | 点击重置按钮时，可以用指定表单值来重置                                                                                                                        | () => Record<string, any> | -                                        |
| switch-to-invalid | 校验失败时自动展开，把出错的字段露出来                                                                                                                        | boolean                   | true                                     |
| schemes           | 声明式字段；与插槽里的 `co-form-item` 等价，各项 `modelValue` 即初值                                                                                          | FormQueryScheme[]         | []                                       |
| submit-on-enter   | 输入框里按 Enter 直接提交                                                                                                                                     | boolean                   | true                                     |

### FormQueryScheme

```ts
type FormQueryScheme = FormItemProps<FieldType> & {
  render?: (params: { model: Record<string, any> }) => VNodeChild;
  slots?: Record<string, unknown>;
};
```

### FormQuerySlots

继承 [FormSlots](./form#formslots)。

### FormQueryEmits

继承 [FormEmits](./form#formemits)，并有以下额外事件。

| 事件             | 描述               | 类型                         |
| ---------------- | ------------------ | ---------------------------- |
| update:collapsed | 折叠状态改变时触发 | (collapsed: boolean) => void |

### FormQueryExpose

继承 [FormExpose](./form#formexpose)，并有以下额外方法。

| 方法           | 描述                                                            | 类型                                                                   |
| -------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------- |
| getFieldsValue | 模型快照（深拷贝），可直接当请求参数                            | () => Record\<string, any>                                             |
| setFieldsValue | 批量写模型                                                      | (values: Record\<PropertyKey, any>) => void                            |
| getModel       | 原始模型（响应式对象），改它不会触发查询，需要配合 `submit()`   | () => Record\<string, any>                                             |
| reset          | 传回调时同 `FormExpose.reset`；传对象时先重置、再把对象写回模型 | (valuesOrCallback?: Record\<PropertyKey, any> \| (() => void)) => void |
