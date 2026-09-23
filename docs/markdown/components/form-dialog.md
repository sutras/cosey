# FormDialog 对话框表单

## 简介

`FormDialog` 是 `ElDialog` 组件的高阶组件，拥有相同的接口，用于配合 `Form` 组件使用，`Form` 表单的按钮会移到 `FormDialog` 的底部插槽位置。

## 代码演示

### 基础演示

::: demo

form-dialog/basic

:::

### useUpsert

可使用 `useUpsert` 来简化“新增/编辑”弹出框表单的使用。

编辑时详情回填是异步的，回填期间 `loading` 为 `true`，可以绑定 `v-loading` 避免先闪一个空表单。

::: demo

form-dialog/user-upsert

:::

### useOuterUpsert

“新增/编辑”弹出框表单一般放在单独的文件中，为了简化操作，可以使用 `useOuterUpsert` 函数。

`add`、`edit` 返回 `Promise`，`await` 之后表单已经回填完成，可以在打开后继续操作表单。

::: demo

form-dialog/use-outer-upsert

:::

## API

### FormDialogProps

继承 `element-plus` 的 [Dialog Attributes](https://element-plus.org/zh-CN/component/dialog.html#attributes)，并添加以下属性：

| 属性          | 描述             | 类型        | 默认值 |
| ------------- | ---------------- | ----------- | ------ |
| confirm-text  | 确定按钮的文案   | string      | '确定' |
| cancel-text   | 取消按钮的文案   | string      | '取消' |
| confirm-props | 确定按钮的属性   | ButtonProps | -      |
| cancel-props  | 取消按钮的属性   | ButtonProps | -      |
| hide-confirm  | 是否隐藏确定按钮 | boolean     | false  |
| hide-cancel   | 是否隐藏取消按钮 | boolean     | false  |

### FormDialogSlots

继承 `element-plus` 的 [Dialog Slots](https://element-plus.org/zh-CN/component/dialog.html#slots)，并添加以下插槽。

| 插槽   | 描述           | 属性                                                                             |
| ------ | -------------- | -------------------------------------------------------------------------------- |
| button | 自定义表单按钮 | { submitting: boolean; confirm: () => any \| Promise\<any\>; cancel: () => any;} |

### FormDialogEmits

继承 `element-plus` 的 [Dialog Events](https://element-plus.org/zh-CN/component/dialog.html#events)。

### FormDialogExpose

继承 `element-plus` 的 [Dialog Exposes](https://element-plus.org/zh-CN/component/dialog.html#exposes)。

### useUpsert

```ts
function useUpsert<
  Model extends Record<string, any>,
  Row extends Record<string, any> = Model,
  Data = any,
>(options: MaybeRefOrGetter<UseUpsertOptions<Model, Row>>): UseUpsertReturn<Model, Row, Data>;

interface UseUpsertOptions<Model, Row = Model> {
  title?: MaybeRefOrGetter<string>;
  stuffTitle?: MaybeRefOrGetter<string>;
  model: Model;
  onAdd?: (...args: any[]) => void;
  onEdit?: (row: Row, ...args: any[]) => void;
  onShow?: () => void;
  onShown?: () => void;
  onShownAdd?: (...args: any[]) => void;
  onShownEdit?: (row: Row, ...args: any[]) => void;
  detailsFetch?: (row: Row) => any;
  beforeFill?: (row: Row) => any;
  addFetch?: (...args: any[]) => any;
  editFetch?: (row: Row, ...args: any[]) => any;
  success?: (res: any) => any;
  addSuccessText?: MaybeRefOrGetter<string>;
  editSuccessText?: MaybeRefOrGetter<string>;
}

interface UseUpsertReturn<
  Model extends Record<string, any>,
  Row extends Record<string, any> = Model,
  Data = any,
> extends UseUpsertExpose<Row, Data> {
  dialogProps: {
    modelValue: boolean;
    'onUpdate:modelValue': (value: boolean) => void;
    title: string;
  };
  formProps: {
    model: Model;
    ref: string;
    submit: () => Promise<void>;
  };
  formRef: Readonly<ShallowRef<any>>;
  data: ShallowRef<Data | undefined>;
  expose: UseUpsertExpose<Row, Data>;
  row: ShallowRef<Row | undefined>;
  type: Readonly<Ref<UpsertType>>;
  isEdit: ComputedRef<boolean>;
  isAdd: ComputedRef<boolean>;
  loading: Readonly<Ref<boolean>>;
}

interface UseUpsertExpose<Row extends Record<string, any>, Data = any> {
  edit: (row: Row, ...args: any[]) => Promise<void>;
  add: (...args: any[]) => void;
  setData: (data: Data) => UseUpsertExpose<Row, Data>;
  setOptions: (options: UseUpsertExposeOptions) => any;
}

interface UseUpsertExposeOptions {
  success?: () => any;
}

type UpsertType = 'edit' | 'add';
```

#### UseUpsertOptions

| 属性            | 描述                                                                                                             |
| --------------- | ---------------------------------------------------------------------------------------------------------------- |
| title           | 完整标题，会替换 `stuffTitle`。支持 `string`、`Ref` 或 `() => string`                                            |
| stuffTitle      | 标题后缀，会使用 '新增'、'编辑' 拼接。支持 `string`、`Ref` 或 `() => string`                                     |
| model           | 表单的模型对象，必填                                                                                             |
| onAdd           | 调用 UseExternalUpsertReturn['add'] 方法时触发的回调，接收传递的所有参数                                         |
| onEdit          | 调用 UseExternalUpsertReturn['edit'] 方法时触发的回调，接收传递的所有参数                                        |
| onShow          | 对话框显示前触发的回调，此时可能获取不到dom元素                                                                  |
| onShown         | 对话框显示时触发的回调，此时可以获取到dom元素                                                                    |
| onShownAdd      | 调用 UseExternalUpsertReturn['add'] 方法，并在对话框显示时触发的回调，接收传递的所有参数，此时可以获取到dom元素  |
| onShownEdit     | 调用 UseExternalUpsertReturn['edit'] 方法，并在对话框显示时触发的回调，接收传递的所有参数，此时可以获取到dom元素 |
| detailsFetch    | 调用 UseExternalUpsertReturn['edit'] 方法时触发的回调，用于获取详情数据回填表单                                  |
| beforeFill      | 调用 UseExternalUpsertReturn['edit'] 方法时触发的回调，用于回填表单前修改数据                                    |
| addFetch        | 用于提交新增表单                                                                                                 |
| editFetch       | 用于提交编辑表单                                                                                                 |
| success         | 提交表单成功后的回调，接收接口的返回值                                                                           |
| addSuccessText  | 新增成功后的提示语。支持 `string`、`Ref` 或 `() => string`                                                       |
| editSuccessText | 编辑成功后的提示语。支持 `string`、`Ref` 或 `() => string`                                                       |

#### UseUpsertReturn

| 属性        | 描述                                                                   |
| ----------- | ---------------------------------------------------------------------- |
| dialogProps | 绑定到 `FormDialog` 组件的属性                                         |
| formProps   | 绑定到 `Form` 组件的属性                                               |
| data        | 获取通过 UseExternalUpsertReturn['setData'] 设置的数据                 |
| expose      | 表单弹出框组件暴露出去的对象，用于连接 `useUpsert` 和 `useOuterUpsert` |
| formRef     | `Form` 组件的实例                                                      |
| row         | 当前编辑的行（`edit` 传入行的深拷贝），新增时为 `undefined`            |
| type        | 当前表单类型（新增或编辑）                                             |
| isEdit      | 是否为编辑表单                                                         |
| isAdd       | 是否为新增表单                                                         |
| loading     | 详情回填（`detailsFetch`、`beforeFill`）进行中                         |

#### 补充说明

- 只有 `model` 初始声明过的字段会被回填和重置，详情接口返回的其它字段会被忽略。
- 详情回填是异步的：回填完成前点确定，会先等回填结束再提交；接口较慢时可以给表单项绑定 `v-loading="loading"`。
- 详情接口报错时会关闭对话框，避免用户对着空表单提交。
- 同一时刻只认最后一次打开的详情结果：连续点两行的“编辑”，或编辑过程中切到“新增”，前一次打开的详情会被丢弃。
- `edit`、`add` 返回 `Promise`，`await` 之后表单已经回填完成。

### useOuterUpsert

```ts
function useOuterUpsert<Row extends Record<string, any>, Data>(
  options?: UseExternalUpsertOptions,
): UseExternalUpsertReturn<Row, Data>;

interface UseExternalUpsertOptions {
  success?: () => any;
}

interface UseExternalUpsertReturn<Row extends Record<string, any>, Data> {
  add: (...args: any[]) => void;
  edit: (row: Row, ...args: any[]) => Promise<void>;
  setData: (data: Data) => void;
  expose: Readonly<ShallowRef<UseUpsertExpose<Row, Data> | null>>;
  ref: (_expose: any) => void;
}
```

#### UseExternalUpsertOptions

| 属性    | 描述                                   |
| ------- | -------------------------------------- |
| success | 提交表单成功后的回调，通常用于刷新表格 |

#### UseExternalUpsertReturn

| 属性    | 描述                                                         |
| ------- | ------------------------------------------------------------ |
| add     | 显示表单弹出框，并设置类型为“新增”                           |
| edit    | 显示表单弹出框，设置类型为“编辑”并回填详情，返回 `Promise`   |
| setData | 设置数据，可通过 UseUpsertReturn['data'] 获取                |
| ref     | 用于获取表单弹出框组件，连接 `useUpsert` 和 `useOuterUpsert` |
