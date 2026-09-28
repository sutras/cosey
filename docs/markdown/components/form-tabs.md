# FormTabs 表单页签

## 简介

`FormTabs` 是 `ElTabs` 组件的高阶组件，拥有相同的接口，用于配合 `Form` 组件把过长的表单按页签分组。
页签容器用 `FormTabPanel`（对应 `ElTabPane`），`FormItem` 直接写在页签里即可。

相比直接用 `ElTabs`，它额外解决了「隐藏起来的字段出错看不见」这一整条链路：

- **校验失败时自动切到出错的页签**：`FormDialog` / `FormDrawer` 的确定按钮在校验失败时不会给出提示，
  如果出错的字段恰好在未激活的页签里，用户看到的就是「点了确定没反应」。
- **滚动到出错字段**：切到正确的页签还不够，长表单里字段可能仍在视口外。
- **页签标题上显示错误数量**：让用户知道还有哪个页签需要处理。
- **弹窗/抽屉打开时回到第一个页签**：否则会停留在上一次打开时的页签上。

## 代码演示

### 基础演示

两个页签里都有必填项，点「提交」时会自动切到出错字段所在的页签，
出错后页签标题上会出现数量徽标。

::: demo

form-tabs/tabs

:::

### 在弹窗中使用

配合 `FormDialog` 使用时，每次打开都会回到第一个页签。

::: demo

form-tabs/tabs-in-dialog

:::

### 透传 el-tabs 的属性

`FormTabs` 的属性和事件与 `ElTabs` 一致（`tab-position`、`stretch`、`before-leave` 等都可用），
也可以用 `v-model` 自己控制当前页签。

::: demo

form-tabs/tabs-attributes

:::

### 动态增删页签

页签可以用 `v-if` 动态增删（例如某个页签只对特定类型开放）。
如果把**当前激活**的那个页签移除了，会自动落到第一个仍存在的页签 ——
否则 `el-tabs` 会停在一个已经消失的名字上：没有任何页签是激活态，其余内容区全是 `display: none`，
用户看到的是**整个表单体一片空白**。

::: demo

form-tabs/tabs-dynamic

:::

## API

### FormTabsProps

继承 `element-plus` 的 [Tabs Attributes](https://element-plus.org/zh-CN/component/tabs.html#tabs-attributes)，并添加以下属性：

| 属性              | 描述                                     | 类型    | 默认值 |
| ----------------- | ---------------------------------------- | ------- | ------ |
| switch-to-invalid | 校验失败时切换到第一个包含出错字段的页签 | boolean | true   |
| reset-on-open     | 所在弹窗/抽屉打开时，回到第一个页签      | boolean | true   |
| show-badge        | 在页签标题上显示该页签内的错误数量       | boolean | true   |

### FormTabsExpose

| 名称            | 描述                                       | 类型                            |
| --------------- | ------------------------------------------ | ------------------------------- |
| activeName      | 当前激活的页签                             | `string \| number \| undefined` |
| activate        | 激活指定页签                               | `(name) => void`                |
| validateCurrent | 校验当前页签，不通过时会切到出错位置并滚动 | `() => Promise<boolean>`        |
| getTabNames     | 所有页签名，按显示顺序                     | `() => (string \| number)[]`    |

### FormTabPanelProps

继承 `element-plus` 的 [TabPane Attributes](https://element-plus.org/zh-CN/component/tabs.html#tab-pane-attributes)，并添加以下属性：

| 属性 | 描述                                       | 类型             | 默认值 |
| ---- | ------------------------------------------ | ---------------- | ------ |
| name | 页签的标识，不传时由组件自动生成一个唯一值 | string \| number | -      |

### FormTabPanelSlots

继承 `element-plus` 的 [TabPane Slots](https://element-plus.org/zh-CN/component/tabs.html#tab-pane-slots)，并添加以下插槽：

| 插槽名 | 描述                                                     |
| ------ | -------------------------------------------------------- |
| label  | 自定义页签标题；只用它替换标题文本，错误徽标仍会照常显示 |

## 说明

### 不绑 `v-model` 也能用

当前页签由 vue 的 `useModel` 管理，父级的绑定方式决定了它是受控还是自由：

| 父级用法                           | 行为                                    |
| ---------------------------------- | --------------------------------------- |
| `v-model="activeTab"`              | 受控，切换通过 `update:modelValue` 回写 |
| 不写、或只写 `:model-value="name"` | 自动退回组件内部状态，内部切换直接生效  |

所以「校验失败自动切页签」「打开弹窗回到第一页」这两个**内部**行为在两种用法下都成立，
不用为了它们额外声明一个 `v-model`。只有一种情况会失效：写了 `v-model` 但绑定的目标不接受写入
（比如只读的 `computed`），此时组件会等一个永远不来的回写。

### 未激活页签里的字段也会被校验

页签的内容是「渲染后隐藏」（`display: none`），`FormItem` 在挂载时就已经把自己注册给了 `el-form`，
因此隐藏页签里的字段同样参与校验、也会显示错误信息 —— 只是用户看不见，这正是需要自动切换页签的原因。

⚠️ 不要给 `FormTabPanel` 加 `lazy`：未挂载的页签不会注册字段，整个校验会跳过它们，能空着提交上去。

### 只有「整体校验」才会打断用户

表单的校验状态变化分几种场景：提交/整体校验（`validate`）、局部校验（`validate-field`）、
字段自身的实时校验（`field`）、重置（`reset`）。

只有第一种会触发**切换页签 + 滚动定位**。打字时 blur 触发的实时校验如果也切页签，
用户每填错一格就会被拽走，反而更难填。

### 字段属于哪个页签是怎么判断的

`FormTabs` 在校验失败时，会拿出错字段的 `prop` 去匹配 `el-form` 的 `fields`，
再用 DOM 包含关系（`页签元素.contains(字段元素)`）确认它落在哪个页签里。

这样既不用要求「字段必须声明自己属于哪个页签」，`v-if` 动态出现/消失的字段也天然正确。
匹配是从第一个页签开始找的，只会切换一次，不会在多个页签之间来回跳。

页签的排列顺序按 **DOM 顺序**（`compareDocumentPosition`）计算，而不是注册顺序 ——
`v-if` 条件渲染的页签是在条件成立时才注册的，`v-for` 重排也不会让已挂载的组件重新注册，
两种情况都会让注册顺序和视觉顺序不一致。

### 页签被移除时清理了什么

`FormTabPanel` 卸载时会把两样东西一起收拾掉，避免留下指向不存在页签的状态：

- **该页签的错误计数** —— 否则同名页签重新挂上来时会亮出一个「幽灵徽标」。
- **失效的激活页签** —— 当前激活页签不存在了就回落到第一个仍存在的页签（见「动态增删页签」的演示）。

⚠️ **但表单模型里的值不会被清掉**：`v-if` 摘掉页签只是卸载了里面的字段（校验也随之不再覆盖它们），
`model` 上那个值仍然在，提交时照样会带上。要「隐藏即清空」得自己处理
（`watch` 条件变化时把对应字段置空）。

### 同一个表单里可以放多个分组容器

`FormTabs`、`FormGroup`、`FormQuery`、`FormList` 都基于同一套契约
（`FormContext` 的 `onValidateChange` / `getFields` / `getInvalidFields`），
所以它们可以嵌套、可以同时存在，校验失败时会各自把自己「打开」到能看见出错字段的状态，
最后由表单统一滚动到第一个可见的出错字段。
