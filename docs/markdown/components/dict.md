# Dict 字典

## 简介

用一份声明统一「表单选项、表格标签、详情文案」，避免状态文案和颜色散落在各处。字典可以同步注册，也可以异步拉取，全局共享且只加载一次。

## 代码演示

### 基础使用

::: demo

dict/basic

:::

## 用法

### 注册

在 `launch` 里集中配置，值支持数组、对象、以及返回它们的（异步）函数：

```ts
import { launch } from 'cosey';

launch(app, {
  dict: {
    // 需要多语言时用 labelKey（key 来自项目自己的语言包）
    user_status: [
      { value: 1, labelKey: 'user.status.enabled', color: 'success' },
      { value: 0, labelKey: 'user.status.disabled', color: 'info' },
    ],
    // 固定文案用 label
    audit_status: [
      { value: 1, label: '已通过', color: 'success' },
      { value: 0, label: '已驳回', color: 'danger' },
    ],
    // 对象形式
    yes_no: { 1: '是', 0: '否' },
    // 异步
    dept: () => getDeptOptions(),
  },
});
```

也可以运行时注册，后注册的会覆盖同名项：

```ts
import { registerDicts } from 'cosey';

registerDicts({ user_status: [...] });
```

> 对象形式的键是字符串，且数字键会被 JavaScript 按升序重排。需要严格控制顺序时请用数组形式。

### 多语言

`labelKey` 是 i18n 的 key，优先于 `label`，渲染时按当前语言翻译；切换语言会自动更新，不需要重新加载字典。`label` 与 `labelKey` 可以在同一个字典里混用。

解析顺序：

1. **应用自己的词条** — `launch({ i18n: { messages: [{ value: 'zh-cn', app: {...} }] } })` 里配的 key
2. **框架内置词条** — `co.*` 命名空间，跟随框架语言包切换
3. 两条都没命中时返回 key 本身，便于发现漏配

```ts
// 项目语言包里：{ user: { status: { enabled: '启用' } } }
{
  value: 1,
  labelKey: 'user.status.enabled',
}
```

> 应用词条走 vue-i18n 实例，所以 `labelKey` 可以复用项目已有的翻译文件；`co.*` 只是框架自带的兜底，不需要在项目语言包里重复定义。

### 字典名的类型提示

`useDict('...')` 与 `<co-dict-tag dict="...">` 的字典名走 `DictName`，默认是 `string`。在项目的 `d.ts` 里扩展 `DictNameMap` 后就能获得补全：

```ts
declare module 'cosey' {
  interface DictNameMap {
    user_status: true;
    audit_status: true;
  }
}
```

扩展后写成未声明的字典名**不会**报错（仍是 `LiteralUnion`），只是不会被补全，方便后端临时下发新字典。

### 取值

```ts
import { useDict } from 'cosey';

const { options, getLabel, getColor, getItem, loading, reload } = useDict('user_status');

getLabel(1); // '启用'（labelKey 按当前语言翻译，值是语言包里的文案）
getColor(1); // 'success'
```

`options` 可直接作为 `co-field` 的 `options` 使用：

```vue
<co-form-item field-type="select" :field-props="{ options }" />
```

## API

### useDict

| 参数 / 返回值 | 描述                                                          | 类型                                      |
| ------------- | ------------------------------------------------------------- | ----------------------------------------- |
| name          | 字典名，支持 ref / getter                                     | MaybeRefOrGetter\<DictName\>              |
| items         | 字典项                                                        | Ref\<DictItem[]\>                         |
| options       | `items` 的别名                                                | Ref\<DictItem[]\>                         |
| loading       | 是否加载中                                                    | Ref\<boolean\>                            |
| error         | 加载错误                                                      | Ref\<any\>                                |
| getItem       | 取字典项                                                      | (value: any) => DictItem                  |
| getLabel      | 取文案（`labelKey` 会翻译），找不到时回退到 `fallback` 或原值 | (value: any, fallback?: string) => string |
| getText       | `getLabel` 的语义化别名                                       | (value: any, fallback?: string) => string |
| getColor      | 取颜色                                                        | (value: any) => string                    |
| reload        | 重新加载                                                      | () => Promise\<void\>                     |

### DictItem

| 字段     | 描述                                                            | 类型             |
| -------- | --------------------------------------------------------------- | ---------------- |
| label    | 固定文案；需要多语言时改用 `labelKey`                           | string           |
| labelKey | i18n key，优先于 `label`，随语言切换                            | string           |
| value    | 值                                                              | string \| number |
| color    | 标签颜色：`success` / `warning` / `danger` / `info` / `primary` | string           |
| disabled | 是否禁用                                                        | boolean          |

### CoDictTagProps

| 属性     | 描述                                 | 类型                            | 默认值 |
| -------- | ------------------------------------ | ------------------------------- | ------ |
| dict     | 字典名                               | DictName                        | -      |
| value    | 当前值                               | string \| number \| boolean     | -      |
| options  | 直接传字典项，优先级高于 `dict`      | DictItem[]                      | -      |
| type     | 覆盖颜色                             | string                          | -      |
| size     | 尺寸                                 | 'large' \| 'default' \| 'small' | -      |
| effect   | 主题                                 | 'dark' \| 'light' \| 'plain'    | -      |
| fallback | 找不到字典项时的文案，默认回退到原值 | string                          | -      |

### CoDictTagSlots

| 插槽    | 描述       | 属性                               |
| ------- | ---------- | ---------------------------------- |
| default | 自定义内容 | { label: string; item?: DictItem } |
