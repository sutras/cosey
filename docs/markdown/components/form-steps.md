# FormSteps 分步表单

## 简介

`FormSteps` 是 `ElSteps` 组件的高阶组件，拥有相同的接口，用于把过长的表单拆成几步填写。
步骤容器用 `FormStep`（对应 `ElStep`），`FormItem` 直接写在步骤里即可。

相比直接用 `ElSteps` + 自己拼内容，它额外解决了分步表单最容易踩的几件事：

- **翻页与提交按钮自动接好**：在 `FormDialog` / `FormDrawer` 里，「确定」按钮在前几步会变成
  「下一步」，并自动多出一个「上一步」，不用在表单里再摆一套按钮（两套按钮一挤就错位）。
- **最后一步就是「提交」**：不管是弹窗还是普通页面，最后一步的主按钮都是「提交」——
  普通页面下它会接管 `Form` 的提交，并让 `Form` 收起自己的「提交 + 重置」行，
  不会出现两套按钮并存。
- **只校验当前步骤**：「下一步」只校验当前这一屏的字段，通过才前进；
  校验不通过会滚动到出错字段，并把该步骤标记成出错状态。
- **整体提交失败时自动跳到出错的步骤**：最后一步点「提交」校验的是整个表单，
  如果出错字段在前面的步骤里，会先自动切过去，再滚到字段上。
- **弹窗/抽屉打开时回到第一步**：否则会停留在上一次打开时的步骤上。

## 代码演示

### 基础用法

三步表单：点「下一步」只校验当前步骤，点步骤标题可以直接跳转。
最后一步的主按钮是「提交」，会自动接管 `Form` 的提交（`Form` 自己的「提交 + 重置」行不再渲染）。

::: demo

form-steps/basic

:::

### 在弹窗中使用

配合 `FormDialog` 时，**不要**再自己写翻页按钮 —— 弹窗底部的「确定」在前两步就是「下一步」，
并会自动补一个「上一步」；到了最后一步才变回「确定」并提交整个表单。

::: demo

form-steps/in-dialog

:::

### 在抽屉中使用

`FormDrawer` 与 `FormDialog` 共用同一套底部按钮，用法完全一致。

::: demo

form-steps/in-drawer

:::

### 自定义当前步骤与步骤栏

`v-model` 是受控的，可以用外部按钮切换步骤；`simple` / `clickable` 等属性与 `ElSteps` 一致。

::: demo

form-steps/attributes

:::

### 动态增删步骤

步骤可以用 `v-if` 动态增删。把**当前**那一步摘掉后会自动落到仍存在的步骤上 ——
否则步骤栏会停在越界的序号上：所有步骤都不是激活态，内容区一片空白。

::: demo

form-steps/dynamic

:::

## API

### FormStepsProps

继承 `element-plus` 的 [Steps Attributes](https://element-plus.org/zh-CN/component/steps.html#steps-attributes)，并添加以下属性：

| 属性              | 描述                                       | 类型             | 默认值         |
| ----------------- | ------------------------------------------ | ---------------- | -------------- |
| v-model           | 当前步骤序号，从 0 开始                    | number           | 0              |
| switch-to-invalid | 整体校验失败时切到第一个包含出错字段的步骤 | boolean          | true           |
| reset-on-open     | 所在弹窗/抽屉打开时回到第一步              | boolean          | true           |
| clickable         | 点击步骤标题可以跳转                       | boolean          | true           |
| show-status       | 把含出错字段的步骤标记为 error             | boolean          | true           |
| body-min-height   | 内容区最小高度，避免步骤之间高低差导致抖动 | string \| number | 120            |
| submit-text       | 最后一步「提交」按钮的文案                 | string           | co.form.submit |
| submit-props      | 最后一步「提交」按钮的 props               | object           | -              |

> 因为当前步骤由 `v-model` 管理，`ElSteps` 自己的 `active` 属性不再接收（传了也不会生效）。

### FormStepsSlots

| 插槽名  | 描述                        | 属性                               |
| ------- | --------------------------- | ---------------------------------- |
| default | 步骤内容（一组 `FormStep`） | -                                  |
| actions | 自定义底部操作区            | `FormStepsActionContext`（见下表） |

`FormStepsActionContext`：

| 属性       | 描述                             | 类型                     |
| ---------- | -------------------------------- | ------------------------ |
| current    | 当前步骤序号                     | number                   |
| total      | 步骤总数                         | number                   |
| isFirst    | 是否是第一步                     | boolean                  |
| isLast     | 是否是最后一步                   | boolean                  |
| prev       | 上一步                           | () => void               |
| next       | 校验当前步骤后前进，返回是否成功 | () => Promise\<boolean\> |
| submitting | 是否正在提交                     | boolean                  |
| submit     | 提交整个表单                     | () => Promise\<void\>    |

### FormStepsEmits

| 事件   | 描述               | 类型                                    |
| ------ | ------------------ | --------------------------------------- |
| change | 当前步骤变化时触发 | (current: number, prev: number) => void |

### FormStepsExpose

| 名称            | 描述                                   | 类型                     |
| --------------- | -------------------------------------- | ------------------------ |
| current         | 当前步骤序号                           | number                   |
| total           | 步骤总数                               | number                   |
| isFirst         | 是否是第一步                           | boolean                  |
| isLast          | 是否是最后一步                         | boolean                  |
| goTo            | 切到指定步骤（越界会被夹到有效范围内） | (index: number) => void  |
| prev            | 上一步                                 | () => void               |
| next            | 校验当前步骤后前进，返回是否成功       | () => Promise\<boolean\> |
| validateCurrent | 校验当前步骤，不通过时会滚动到出错字段 | () => Promise\<boolean\> |
| submitting      | 是否正在提交                           | boolean                  |
| submit          | 提交整个表单                           | () => Promise\<void\>    |

### FormStepProps

继承 `element-plus` 的 [Step Attributes](https://element-plus.org/zh-CN/component/steps.html#step-attributes)
（`title` / `description` / `icon` / `status`）。

### FormStepSlots

| 插槽名      | 描述                                    |
| ----------- | --------------------------------------- |
| default     | 该步骤的表单内容                        |
| title       | 自定义步骤标题，替代 `title` 属性       |
| description | 自定义步骤描述，替代 `description` 属性 |

## 说明

### 翻页 / 提交按钮去哪了

`FormSteps` 会检测自己有没有被 `FormDialog` / `FormDrawer` 包着，把主按钮放在对应位置：

| 使用位置              | 按钮在哪                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------- |
| 弹窗 / 抽屉里         | 由弹窗底部统一提供（「下一步」「上一步」「取消」，最后一步是「确定」），组件不再自己渲染 |
| 普通页面（`Form` 里） | 组件在内容区下方渲染「下一步」「上一步」，最后一步渲染「提交」                           |

普通页面下，「提交」会接管 `Form` 的提交，同时让 `Form` 自动收起自己的「提交 + 重置」行，
避免两套按钮并存。两套按钮同时出现会互相挤位置，所以只要组件能接管，就把按钮交给它。
想强行自己摆按钮时，直接写 `actions` 插槽（写了就一定会渲染，此时 `Form` 的按钮行不会被收起）。

### 步骤状态是怎么来的

步骤上的 `error` 标记来自「这一步里当前有几个字段校验失败」，判断方式是
`步骤元素.contains(字段元素)`，不要求字段声明自己属于哪一步，
`v-if` 动态出现/消失的字段也天然正确。

字段出错后紧接着修好，标记会立刻消失（实时校验也会同步状态，只是**不会**切步骤）。

⚠️ 自己传了 `status` 属性时以你传的为准 —— 组件只在 `status` 为空时才标记 `error`。

### 未激活步骤里的字段也会被校验

步骤内容是「渲染后隐藏」（`display: none`），`FormItem` 在挂载时就已经把自己注册给了 `el-form`，
因此隐藏步骤里的字段同样参与**整体**校验、也会显示错误信息 —— 只是用户看不见，
这正是「整体校验失败时自动切到出错步骤」以及「滚动定位要跳过不可见字段」的原因。

「下一步」走的是**局部校验**，只校验当前步骤，不会因为别处留着历史错误就把用户拽走。

### 步骤序号会随增删变化

`v-model` 是**序号**（和 `ElSteps` 的 `active` 一致），所以用 `v-if` 增删步骤时，
如果删掉的是前面的步骤，后面步骤的序号会整体前移。

需要「记忆住具体某一步」时，建议自己存一份业务上的标记（比如步骤对应的名称），
在增删后把 `v-model` 写到对应的序号上。

### 和其他分组容器共存

`FormSteps`、`FormTabs`、`FormGroup`、`FormQuery`、`FormList` 都基于同一套契约
（`FormContext` 的 `onValidateChange` / `getFields` / `getInvalidFields`），
所以可以嵌套、可以同时存在，校验失败时各自把自己「打开」到能看见出错字段的状态，
最后由表单统一滚动到第一个可见的出错字段。

### 同一个表单里只放一个

一个表单里放多个 `FormSteps`，只有最后挂载的那个会接管提交按钮（普通页面）或弹窗底部的
「下一步」。分步表单和页签一样，一层就够用。
