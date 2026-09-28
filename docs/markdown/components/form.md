# Form 表单

## 简介

在原来的 `ElForm` 的基础上增加了一些语法糖和更多的布局设置，帮助我们快速地开发一个表单，同时添加了一些默认行为，让我们的表单默认好用。

分步表单、Modal 表单、Drawer 表单、查询表单、轻量筛选等多种 layout 可以覆盖大部分的使用场景，让我们脱离复杂而且繁琐的表单布局工作，用更少的代码完成更多的功能。

`Form` 没有黑科技，只是 `ElForm` 的封装，如果要使用自定义的组件可以用 `ElFormItem` 包裹后使用，支持混用。

## 何时使用 Form？

当你想快速实现一个表单但不想花太多时间去布局时 `Form` 是最好的选择。

`Form` 是基于 `ElForm` 的可降级封装，与 `element-plus` 功能完全对齐，但是在其之上还增加一些预设行为和多种布局。这些布局之间可以无缝切换，并且拥有公共的 API。

## 代码演示

### FormItem 表单项

一个表单除了 `Form` 之外还是需要一系列的表单项，`FormItem` 自带了数量可观的表单项，这些组件本质上是 `ElFormItem` 和表单组件的结合，我们可以把他们当成一个 `ElFormItem` 来使用，并且支持各种 `props`。每个表单项都支持 `field-type` 来指定组件类型，同时支持 `field-props` 属性来支持设置输入组件的 `props`。 我们支持 `v-model` 和 `placeholder` 等属性的透传。

下文把所有的输入组件统称为 `field`。

`ElFormItem + ElInput` 可以通过以下代码实现：

::: demo

form/form-item

:::

`field` 的插槽内容可以直接放在 `FormItem` 里面，根据设置的 `field-type` 值会自动推断出插槽的接口类型。

::: demo

form/form-item-slot

:::

#### field-props

`field` 的 `props` 和事件都可以通过 `field-props` 定义，事件名需要转换为以 `on` 开头紧跟大写字母的形式。
同插槽的使用，只要设置了 `field-type` ，便可以享受 `props` 的类型推断。

::: demo

form/field-props

:::

#### 提示信息

使用 `tooltip` 属性或插槽可以在标签右边显示icon，鼠标移上去会显示提示信息。

::: demo

form/form-item-tooltip

:::

#### 额外信息

使用 `extra` 属性或插槽可以在 `field` 下面显示额外信息。

::: demo

form/form-item-extra

:::

### FormGroup 表单组

`FormGroup` 在需要的时候用来将表单项组合在一起，可以实现自定义的表单布局。

::: demo

form/form-group

:::

表单组还支持折叠功能，在一个大型表单中用于收纳暂不处理的一组表单项。

::: demo

form/collapsible-form-group

:::

可以使用 `tooltip` 属性在标题右边显示提示语。

::: demo

form/form-group-tooltip

:::

### 基础表单

一个基础的表单除了表单项，还有提交、重置按钮，`Form` 内置了这些按钮，同时在提交时给提交按钮添加了加载效果。

校验失败时，表单会自动滚动到**第一个可见的出错字段**（按文档顺序），所以被折叠、或被切走的页签里的字段不会抢走滚动位置；`FormGroup`、`FormTabs`、`FormQuery` 会各自把藏在里面的出错字段展开或切出来。

::: demo

form/basic

:::

### 行内表单

当垂直方向空间受限且表单较简单时，可以在一行内放置表单。

通过设置 inline 属性为 true 可以让表单域变为行内的表单域。

::: demo

form/inline

:::

### 等宽表单项

除了行内表单，也可以将所有表单项放到 `FormGroup` 组件里面，这同样起到行内的效果。

另外，可以在 `Form` 组件上设置 `label-width` 和 `width` 属性来统一让所有表单项的标签和控件宽度一致。

::: demo

form/same-width

:::

### 等宽行内表单

行内表单也可以统一设置标签和控件的宽度。

::: demo

form/same-width-inline

:::

### 标签位置

顶部标签可以让表单控件有更多的空间。

::: demo

form/label-position

:::

### 栅格化布局

栅格化布局可以让表单在父容器不同宽度下展示不同的列数。使用 `grid` 启动栅格化布局，使用 `row-props` 和 `col-props` 设置栅格间隔、列数等。

::: demo

form/grid

:::

### 所有表单项

下面演示了所有的表单项及其在只读状态下的展示。

::: demo

form/all-fields

:::

## API

### FormProps

继承 `element-plus` 的 [Form Attributes](https://element-plus.org/zh-CN/component/form.html#form-attributes) ，并添加以下属性：

| 属性         | 描述                                             | 类型                       | 默认值 |
| ------------ | ------------------------------------------------ | -------------------------- | ------ |
| width        | 统一设置 `field` 为固定宽度                      | FormItemWidth              | -      |
| grid         | 是否开启栅格化模式                               | boolean                    | false  |
| row-props    | 栅格化模式下设置 `Row` 的属性                    | RowProps                   | -      |
| col-props    | 栅格化模式下设置所有 `field` 共同的 `Col` 的属性 | ColProps                   | -      |
| readonly     | 设置表单内所有 `field` 为只读状态                | boolean                    | false  |
| submit       | 提交表单时触发的回调                             | () => any \| Promise\<any> | -      |
| reset        | 重置表单时触发的回调                             | () => any                  | -      |
| submit-text  | 提交按钮的文案                                   | string                     | '提交' |
| reset-text   | 重置按钮的文案                                   | string                     | '重置' |
| submit-props | 提交按钮的属性                                   | ButtonProps                | -      |
| reset-props  | 重置按钮的属性                                   | ButtonProps                | -      |
| hide-submit  | 是否隐藏提交按钮                                 | boolean                    | false  |
| hide-reset   | 是否隐藏重置按钮                                 | boolean                    | false  |
| hide-buttons | 同时隐藏提交和重置按钮                           | boolean                    | false  |

### FormSlots

继承 `element-plus` 的 [Form Slots](https://element-plus.org/zh-CN/component/form.html#form-slots) ，并支持以下插槽。

| 插槽   | 描述           | 属性                                                                          |
| ------ | -------------- | ----------------------------------------------------------------------------- |
| button | 自定义表单按钮 | { submitting: boolean; submit: () => any \| Promise\<any>; reset: () => any;} |

### FormEmits

继承 `element-plus` 的 [Form 事件](https://element-plus.org/zh-CN/component/form.html#form-%E4%BA%8B%E4%BB%B6)。

### FormExpose

继承 `element-plus` 的 [Form Exposes](https://element-plus.org/zh-CN/component/form.html#form-exposes) ，并添加以下属性：

| 属性   | 描述                                        | 类型                            |
| ------ | ------------------------------------------- | ------------------------------- |
| submit | 提交表单                                    | () => Promise\<any>             |
| reset  | 重置表单，callback会在 reset 属性调用前调用 | (callback?: () => void) => void |

### FormItemProps

继承 `element-plus` 的 [FormItem Attributes](https://element-plus.org/zh-CN/component/form.html#formitem-attributes) ，并添加以下属性：

| 属性                  | 描述                                                      | 类型                                                                                | 默认值  |
| --------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------- |
| field-type            | `field` 的类型                                            | FieldType                                                                           | 'input' |
| field-props           | `field` 的 props                                          | MapFieldTypeComponentProps[FieldType]['componentProps']                             | -       |
| field-slots           | `field` 的 slots                                          | MapFieldTypeComponentProps[FieldType]['componentSlots']                             | -       |
| field-ref             | 获取 `field` 暴露的属性                                   | (el: any) => void                                                                   | -       |
| model-value (v-model) | 绑定 `field` 的值                                         | NonNullable<MapFieldTypeComponentProps[FieldType]['componentProps']> ['modelValue'] | -       |
| width                 | 设置 `field` 为固定宽度                                   | FormItemWidth                                                                       | -       |
| placeholder           | 设置 `field` 占位符，仅对带有输入框的组件有效             | string                                                                              | -       |
| disabled              | 设置 `field` 为禁用状态                                   | boolean                                                                             | false   |
| readonly              | 设置 `field` 为只读状态                                   | boolean                                                                             | false   |
| col-props             | 当 `Form` 开启栅格化模式时可以设置其内 `Col` 组件的 props | ColProps                                                                            | -       |
| tooltip               | 配置提示信息                                              | VNodeChild                                                                          | -       |
| extra                 | 额外的提示信息                                            | VNodeChild                                                                          | -       |

### FormItemWidth

```ts
type FormItemWidth = number | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | (string & {});
```

在某些场景下，我们需要根据页面展示效果对输入框进行自适应处理，除此以外一个表单区域应默认使用定宽规则。

- `XS=104px` 适用于短数字、短文本或选项。
- `SM=216px` 适用于较短字段录入、如姓名、电话、ID 等。
- `MD=328px` 标准宽度，适用于大部分字段长度。
- `LG=440px` 适用于较长字段录入，如长网址、标签组、文件路径等。
- `XL=552px` 适用于长文本录入，如长链接、描述、备注等，通常搭配自适应多行输入框或定高文本域使用。

### FormItemSlots

继承 `element-plus` 的 [FormItem Slots](https://element-plus.org/zh-CN/component/form.html#formitem-slots) ，以及对应 `field` 的插槽，并添加以下插槽：

| 插槽    | 描述           | 属性 |
| ------- | -------------- | ---- |
| tooltip | 配置提示信息   | -    |
| extra   | 额外的提示信息 | -    |

### FormItemEmits

| 事件               | 描述                   | 类型                     |
| ------------------ | ---------------------- | ------------------------ |
| update:model-value | `field` 的值改变时触发 | (value: unknown) => void |

### FormItemExpose

继承 `element-plus` 的 [FormItem Exposes](https://element-plus.org/zh-CN/component/form.html#formitem-exposes)。

### FormGroupProps

继承 `element-plus` 的 [Space Attributes](https://element-plus.org/zh-CN/component/space.html#attributes)，并添加以下属性：

| 属性         | 描述                     | 类型                                                          | 默认值       |
| ------------ | ------------------------ | ------------------------------------------------------------- | ------------ |
| alignment    | 对齐的方式 (align-items) | 'stretch' \| 'center' \| 'flex-start' \| 'flex-end'           | 'flex-start' |
| size         | 间隔大小                 | number \| 'default' \| 'small' \| 'large' \| [number, number] | [32, 0]      |
| wrap         | 设置是否自动折行         | boolean                                                       | true         |
| title        | 设置表单组的标题         | string                                                        | -            |
| tooltip      | 设置表单组标题的提示语   | string                                                        | -            |
| border-style | 设置边框样式             | 'none' \| 'solid' \| 'dashed' \| 'dotted'                     | -            |
| position     | 设置标题位置             | 'left' \| 'right' \| 'center'                                 | 'left'       |
| collapsible  | 是否允许折叠             | boolean                                                       | false        |
| collapsed    | 设置是否为折叠状态       | boolean                                                       | false        |

### FormGroupSlots

| 插槽    | 描述                 | 属性 |
| ------- | -------------------- | ---- |
| default | 自定义默认内容       | -    |
| title   | 自定义标题内容       | -    |
| tooltip | 自定义标题提示语内容 | -    |

### FormGroupEmits

| 事件             | 描述               | 类型                         |
| ---------------- | ------------------ | ---------------------------- |
| update:collapsed | 折叠状态改变时触发 | (collapsed: boolean) => void |

### FieldType

#### autocomplete

同 `element-plus` 的 [ElAutocomplete](https://element-plus.org/zh-CN/component/autocomplete.html) 组件。

#### cascader

同 `element-plus` 的 [ElCascader](https://element-plus.org/zh-CN/component/cascader.html) 组件。

#### checkbox

同 `element-plus` 的 [ElCheckbox](https://element-plus.org/zh-CN/component/checkbox.html#checkbox-api) 组件。

#### checkboxgroup

同 `element-plus` 的 [ElCheckboxGroup](https://element-plus.org/zh-CN/component/checkbox.html#checkboxgroup-api) 组件。并添加以下属性：

| 属性           | 描述                          | 类型                                            | 默认值     |
| -------------- | ----------------------------- | ----------------------------------------------- | ---------- |
| options        | 使用配置对象来生成复选框      | (Partial\<CheckboxProps> \| string \| number)[] | -          |
| label-key      | 自定义 `options` 中标签的键名 | string                                          | 'label'    |
| value-key      | 自定义 `options` 中值的键名   | string                                          | 'value'    |
| type           | 设置复选框的类型              | 'button' \| 'checkbox'                          | 'checkbox' |
| checkbox-width | 设置复选框的宽度              | string \| number                                | -          |

#### color

同 `element-plus` 的 [ElColorPicker](https://element-plus.org/zh-CN/component/color-picker.html) 组件。

#### date

同 `element-plus` 的 [ElDatePicker](https://element-plus.org/zh-CN/component/date-picker.html) 组件。

#### daterange

同 `element-plus` 的 [ElDatePicker](https://element-plus.org/zh-CN/component/date-picker.html) 组件。并预设了 `type="daterange"` 属性。

#### dates

同 `element-plus` 的 [ElDatePicker](https://element-plus.org/zh-CN/component/date-picker.html) 组件。并预设了 `type="dates"` 属性。

#### datetime

同 `element-plus` 的 [ElDatePicker](https://element-plus.org/zh-CN/component/date-picker.html) 组件。并预设了 `type="datetime"` 属性。

#### datetimerange

同 `element-plus` 的 [ElDatePicker](https://element-plus.org/zh-CN/component/date-picker.html) 组件。并预设了 `type="datetimerange"` 属性。

#### input

同 `element-plus` 的 [ElInput](https://element-plus.org/zh-CN/component/input.html) 组件。

#### inputtag

同 `element-plus` 的 [ElInputTag](https://element-plus.org/zh-CN/component/input-tag.html) 组件。

#### mention

同 `element-plus` 的 [ElMention](https://element-plus.org/zh-CN/component/mention.html) 组件。

#### month

同 `element-plus` 的 [ElDatePicker](https://element-plus.org/zh-CN/component/date-picker.html) 组件。并预设了 `type="month"` 属性。

#### monthrange

同 `element-plus` 的 [ElDatePicker](https://element-plus.org/zh-CN/component/date-picker.html) 组件。并预设了 `type="monthrange"` 属性。

#### months

同 `element-plus` 的 [ElDatePicker](https://element-plus.org/zh-CN/component/date-picker.html) 组件。并预设了 `type="months"` 属性。

#### number

同 `element-plus` 的 [ElInputNumber](https://element-plus.org/zh-CN/component/input-number.html) 组件。

#### numberrange

同 [InputNumberRange](./input-number-range) 组件。

#### password

同 `element-plus` 的 [ElInput](https://element-plus.org/zh-CN/component/input.html) 组件。并预设了 `type="password"` 属性。

#### radiogroup

同 `element-plus` 的 [ElRadioGroup](https://element-plus.org/zh-CN/component/radio.html#radiogroup-api) 组件。并添加以下属性：

| 属性 | 描述             | 类型                | 默认值  |
| ---- | ---------------- | ------------------- | ------- |
| type | 设置单选框的类型 | 'button' \| 'radio' | 'radio' |

#### rate

同 `element-plus` 的 [ElRate](https://element-plus.org/zh-CN/component/rate.html) 组件。

#### remoteselect

同 [RemoteSelect](./remote-select) 组件。

#### segmented

同 `element-plus` 的 [ElSegmented](https://element-plus.org/zh-CN/component/segmented.html) 组件。

#### select

同 `element-plus` 的 [ElSelect](https://element-plus.org/zh-CN/component/select.html) 组件。并添加以下属性：

| 属性         | 描述                   | 类型                                                                                | 默认值 |
| ------------ | ---------------------- | ----------------------------------------------------------------------------------- | ------ |
| option-props | 自定义 `ElOption` 属性 | Record<PropertyKey, any> \| (props: any, index: number) => Record<PropertyKey, any> | -      |

#### selectv2

同 `element-plus` 的 [ElSelectV2](https://element-plus.org/zh-CN/component/select-v2.html) 组件。并添加以下属性：

| 属性         | 描述                   | 类型                                                                         | 默认值 |
| ------------ | ---------------------- | ---------------------------------------------------------------------------- | ------ |
| option-props | 自定义 `ElOption` 属性 | (props: Record<PropertyKey, any>, index: number) => Record<PropertyKey, any> | -      |

#### slider

同 `element-plus` 的 [ElSlider](https://element-plus.org/zh-CN/component/slider.html) 组件。

#### switch

同 `element-plus` 的 [ElSwitch](https://element-plus.org/zh-CN/component/switch.html) 组件。

#### textarea

同 `element-plus` 的 [ElInput](https://element-plus.org/zh-CN/component/input.html) 组件。并预设了 `type="textarea"` 属性。

#### time

同 `element-plus` 的 [ElTimePicker](https://element-plus.org/zh-CN/component/time-picker.html) 组件。

#### timerange

同 `element-plus` 的 [ElTimePicker](https://element-plus.org/zh-CN/component/time-picker.html) 组件。并预设了 `is-range` 属性。

#### timeselect

同 `element-plus` 的 [ElTimeSelect](https://element-plus.org/zh-CN/component/time-select.html) 组件。

#### transfer

同 `element-plus` 的 [ElTransfer](https://element-plus.org/zh-CN/component/transfer.html) 组件。

#### treeselect

同 `element-plus` 的 [ElTreeSelect](https://element-plus.org/zh-CN/component/tree-select.html) 组件。

#### upload

同 [Upload](./upload) 组件。

#### week

同 `element-plus` 的 [ElDatePicker](https://element-plus.org/zh-CN/component/date-picker.html) 组件。并预设了 `type="week"` 属性。

#### weekrange

同 [WeekRangePicker](./week-range-picker) 组件。

#### year

同 `element-plus` 的 [ElDatePicker](https://element-plus.org/zh-CN/component/date-picker.html) 组件。并预设了 `type="year"` 属性。

#### yearrange

同 `element-plus` 的 [ElDatePicker](https://element-plus.org/zh-CN/component/date-picker.html) 组件。并预设了 `type="yearrange"` 属性。

#### years

同 `element-plus` 的 [ElDatePicker](https://element-plus.org/zh-CN/component/date-picker.html) 组件。并预设了 `type="years"` 属性。
