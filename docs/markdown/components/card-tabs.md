# CardTabs 卡片页签

## 简介

`CardTabs` 是「页签条放在卡片头部」的组合组件：内部就是一张 `co-card`，头部渲染导航、内容区渲染面板，省掉「卡片标题 + 内容区里再套一层 `el-tabs`」的两层留白。

面板写成 `co-card-tab-panel` 的直接子节点即可，导航按书写顺序生成，`label` 就是页签文字。

```vue
<co-card-tabs v-model="active" title="订单 A20241102001">
  <co-card-tab-panel name="base" label="基本信息">…</co-card-tab-panel>
  <co-card-tab-panel name="logs" label="操作日志" lazy>…</co-card-tab-panel>
</co-card-tabs>
```

`ElTabs` 把导航和面板都放在自己的 `.el-tabs` 里，没法分别塞进卡片的头部和主体，所以这里是自绘的导航（只借 `el-tabs` 的外观规范），不依赖 `ElTabs`。

## 代码演示

### 基础用法

详情页最常见：标题在左、页签紧随其后，右侧操作区放打印、导出这类按钮。没权限的页签用 `disabled`，内容较重的面板加 `lazy`，首次切过去才渲染。

默认的 `line` 样式里，激活下划线是一条共享的横条，切换页签时从左滑到右，宽度也跟着页签文字变化。

卡片带 `collapsible` 时折叠只收起面板区，页签留在头部；点页签不会触发折叠。

::: demo

card-tabs/basic

:::

### 分段样式

`tab-type="segment"` 把导航画成一组分段按钮，适合切换维度（时间范围、统计口径）而不是切换内容块的场景。

选中块和 `line` 的下划线一样是共享的一块，切换时滑到激活项上。

页签也可以由数据 `v-for` 生成，导航顺序跟渲染顺序一致。

::: demo

card-tabs/segment

:::

### 卡片样式

`tab-type="card"` 的页签做成贴着标题区下边框的标签块，激活项与内容区连成一片，适合「一个对象 + 几组并列信息」的详情卡。

::: demo

card-tabs/card-type

:::

## API

### CardTabsProps

继承 [CardProps](./card#cardprops)（`title` / `sub-title` / `tooltip` / `extra` / `footer` / `size` / `variant` / `collapsible` 等都可用），并有以下额外属性。

| 属性         | 描述                                                         | 类型                                                | 默认值 |
| ------------ | ------------------------------------------------------------ | --------------------------------------------------- | ------ |
| v-model      | 当前激活的页签名，对应面板的 `name`                          | string \| number                                    | -      |
| tab-type     | 导航样式：`line` 下划线 / `segment` 分段块 / `card` 卡片页签 | `line` \| `segment` \| `card`                       | `line` |
| before-leave | 切换前拦截，返回 `false` 则不切换（可返回 Promise）          | (newName, oldName) => boolean \| Promise\<boolean\> | -      |

`collapsible` 也可用：折叠只收起面板区，导航留在头部。

### CardTabsSlots

继承 [CardSlots](./card#cardslots)（`header` 除外，头部由导航占用）。

| 插槽     | 描述                                 | 属性 |
| -------- | ------------------------------------ | ---- |
| default  | 页签面板，必须是 `co-card-tab-panel` | -    |
| title    | 自定义标题                           | -    |
| subTitle | 自定义副标题                         | -    |
| extra    | 右侧操作区                           | -    |
| footer   | 页脚                                 | -    |

### CardTabsExpose

| 方法/属性   | 描述                     | 类型                             |
| ----------- | ------------------------ | -------------------------------- |
| activeName  | 当前激活的页签名         | string \| number \| undefined    |
| activate    | 激活指定页签（经过拦截） | (name: string \| number) => void |
| getTabNames | 所有页签名，按书写顺序   | () => (string \| number)[]       |

### CardTabsEmits

继承 [CardEmits](./card#cardemits)（`click` / `update:collapsed`），并有以下额外事件。

| 事件              | 描述                                          | 参数                                       |
| ----------------- | --------------------------------------------- | ------------------------------------------ |
| update:modelValue | 激活页签变化                                  | (name: string \| number) => void           |
| tab-click         | 点击页签时触发，点当前已激活的页签也会触发    | (name: string \| number) => void           |
| tab-change        | 切换完成后触发（`before-leave` 拦下时不触发） | (name: string \| number, oldName?) => void |

### CardTabPanelProps

| 属性     | 描述                                      | 类型             | 默认值 |
| -------- | ----------------------------------------- | ---------------- | ------ |
| name     | 页签名，与 `v-model` 对应；不传用面板序号 | string \| number | -      |
| label    | 导航上显示的文字                          | string           | -      |
| disabled | 禁用该页签                                | boolean          | false  |
| lazy     | 首次激活时才渲染内容                      | boolean          | false  |

### CardTabPanelSlots

| 插槽    | 描述                           | 属性 |
| ------- | ------------------------------ | ---- |
| default | 面板内容                       | -    |
| label   | 自定义导航文字，优先于 `label` | -    |

## 说明

- 面板必须是 `co-card-tabs` 的**直接子节点**（`v-for` 生成的除外），中间不能包 `<div>`，否则扫不到、导航不显示。
- 面板默认全部渲染后用 `v-show` 切换，切回来表单、滚动位置都还在；`lazy` 的面板首次激活后同样保留。
- 导航支持左右方向键、`Home` / `End` 切换，禁用页签会被跳过。
- 不给 `title` 时导航占满整个头部；页签过多时导航横向滚动，不会把标题和操作区挤走。
- 没有可关闭页签、拖拽排序、四方位 `tab-position`：需要这些时直接用 `el-tabs`，不要把页签放进卡片头。
