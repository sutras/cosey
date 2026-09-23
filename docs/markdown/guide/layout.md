# 布局

Cosey 提供了默认的布局，也可以自定义布局。

## 配置默认值

`launch` 函数配置项 `layout` 用于配置布局相关默认值。

```ts
import { launch } from 'cosey';

launch(app, {
  layout: {
    menuType: 'biserial',
  },
});
```

可配置属性有：

```ts
export const defaultLayoutConfig = {
  /**
   * 响应式移动设备断点值
   */
  breakpoint: 768,

  /**
   * 是否启用标签页缓存
   */
  keepAlive: true,

  /**
   * 是否默认显示侧边栏
   */
  sidebarVisible: true,

  /**
   * 是否默认折叠收起垂直菜单
   */
  collapse: false,

  /**
   * 菜单类型
   */
  menuType: 'vertical' as
    | 'vertical'
    | 'biserial'
    | 'horizontal'
    | 'horizontal-vertical'
    | 'horizontal-biserial',

  /**
   * 是否显示标签页
   */
  tabbarVisible: true,

  /**
   * 侧边菜单宽度
   */
  asideWidth: 220,

  /**
   * 折叠时侧边栏菜单宽度
   */
  collapsedAsideWidth: 64,

  /**
   * 紧凑侧边菜单宽度
   */
  snugAsideWidth: 85,

  /**
   * 顶部栏高度
   */
  topbarHeight: 48,

  /**
   * 标签栏高度
   */
  tabbarHeight: 41,
};
```

## 自定义布局组件

如果默认的布局组件不能满足需求，可以进行替换。

`launch` 函数配置项 `components` 用于替换默认布局组件。可以复用现有的布局组件，或者定义全新的布局组件。

```ts
import { defineComponent } from 'vue';
import { launch } from 'cosey';

launch(app, {
  components: {
    login: defineComponent({
      render: () => '自定义登录页组件',
    }),
  },
});
```

`components` 类型为：

```ts
interface LayoutComponents {
  base?: string | Component;
  sidebar?: string | Component;
  snugAside?: string | Component;
  snugMenu?: string | Component;
  aside?: string | Component;
  menu?: string | Component;
  mask?: string | Component;
  content?: string | Component;
  header?: string | Component;
  topbar?: string | Component;
  brand?: string | Component;
  toggle?: string | Component;
  topSnugMenu?: string | Component;
  breadcrumb?: string | Component;
  search?: string | Component;
  colorScheme?: string | Component;
  user?: string | Component;
  tabbar?: string | Component;
  main?: string | Component;
  iframe?: string | Component;
  switchEffect?: string | Component;
  auth?: string | Component;
  login?: string | Component;
  changePassword?: string | Component;
  exception?: string | Component;
  forbidden?: string | Component;
  notFound?: string | Component;
  internalServerError?: string | Component;
  empty?: string | Component;
}
```

如果注册了全局组件，可以传入组件名称，或者直接传入组件对象。

下面展示了不同布局组件所在的位置：

<component-layout-model />

如果要在原有模板基础上进行改动，可以拷贝模板代码再进行修改：[github](https://github.com/sutras/cosey/blob/main/packages/cosey/layout/layout.ts)。

## useLayoutStore

`useLayoutStore` 管理着布局相关的全局状态，在自定义布局中你可能需要这些状态。

### 使用

```ts
import { useLayoutStore } from 'cosey/store';

const layoutStore = useLayoutStore();

console.log(layoutStore.collapse);
```

### 接口

#### sidebarVisible

- 类型：`Ref<boolean>`
- 默认值：`true`

是否显示侧边栏。

#### collapse

- 类型：`Ref<boolean>`
- 默认值：`false`

是否折叠收起垂直菜单。

#### isMobile

- 类型：`Ref<boolean>`
- 默认值：`false`

当前是否为移动设备（根据屏幕大小）。

#### menuType

- 类型：`Ref<LayoutMenuType>`
- 默认值：`'vertical'`

菜单类型。

```ts
type LayoutMenuType =
  | 'vertical'
  | 'biserial'
  | 'horizontal'
  | 'horizontal-vertical'
  | 'horizontal-biserial';
```

#### includeHorizontal

- 类型：`ComputedRef<boolean>`

是否包含水平菜单。

#### isVertical

- 类型：`ComputedRef<boolean>`

菜单类型是否为 `vertical`。

#### isBiserial

- 类型：`ComputedRef<boolean>`

菜单类型是否为 `biserial`。

#### isHorizontal

- 类型：`ComputedRef<boolean>`

菜单类型是否为 `horizontal`。

#### isHorizontalVertical

- 类型：`ComputedRef<boolean>`

菜单类型是否为 `horizontal-vertical`。

#### isHorizontalBiserial

- 类型：`ComputedRef<boolean>`

菜单类型是否为 `horizontal-biserial`。

#### menus

- 类型：`Ref<MenuItem[]>`
- 默认值：`[]`

菜单数据。

```ts
interface MenuItem {
  name: string;
  path?: string;
  title?: string;
  icon?: string;
  children?: MenuItem[];
  route: {
    name: string;
    path: string;
    meta: RouteMeta;
    children?: any[];
  };
  _externalLink?: boolean;
  type?: 'group';
  order: number;
}
```

#### menusMap

- 类型：`ComputedRef<Record<string | number, MenuNode>>`
- 默认值：`{}`

菜单映射数据，用于快速获取菜单项。

```ts
interface MenuNode extends MenuItem {
  parent?: MenuItem;
}
```

#### firstLevelMenus

- 类型：`Ref<MenuItem[]>`
- 默认值：`[]`

一级菜单数据。

#### firstLevelActive

- 类型：`Ref<string>`
- 默认值：`''`

当前选择的一级菜单，保存路由的 `name`。

#### secondLevelMenus

- 类型：`ComputedRef<MenuItem[]>`
- 默认值：`[]`

二级菜单数据。

#### secondLevelActive

- 类型：`Ref<string>`
- 默认值：`''`

当前选择的二级菜单，保存路由的 `name`。

#### thirdLevelMenus

- 类型：`ComputedRef<MenuItem[]>`
- 默认值：`[]`

三级菜单数据。

#### topMenus

- 类型：`Ref<MenuItem[]>`
- 默认值：`[]`

顶部菜单数据。

#### topActive

- 类型：`Ref<string>`
- 默认值：`''`

当前顶级菜单，保存路由的 `name`。

#### snugMenus

- 类型：`ComputedRef<MenuItem[]>`
- 默认值：`[]`

snug 菜单数据。

#### snugActive

- 类型：`WritableComputedRef<string>`
- 默认值：`''`

当前选择的 snug 菜单，保存路由的 `name`。

#### defaultMenus

- 类型：`ComputedRef<MenuItem[]>`
- 默认值：`[]`

默认菜单（水平或垂直）。

#### tabbarVisible

- 类型：`Ref<boolean>`
- 默认值：`true`

是否显示标签页。

#### activeTab

- 类型：`Ref<string>`
- 默认值：`''`

当前活动的标签页，保存路由的 `name`。

#### refreshing

- 类型：`Ref<boolean>`
- 默认值：`false`

当前标签页是否处理加载状态。

#### tabList

- 类型：`Ref<LayoutTab[]>`
- 默认值：`[]`

标签页数据。标签页会记录自己最后一次访问的地址，切换回来时按该地址跳转（`query` 等参数一并恢复）。

```ts
interface LayoutTab {
  name: string;
  meta: RouteMeta;
  // 完整地址，由标签栏自动维护；外部自行添加标签页时可不传，此时按 name 跳转
  fullPath?: string;
}
```

#### iframeTabList

- 类型：`ComputedRef<LayoutTab[]>`
- 默认值：`[]`

iframe 标签页数据。

#### keepAliveInclude

- 类型：`Ref<string[]>`
- 默认值：`[]`

缓存的标签页列表。

#### keepAliveExclude

- 类型：`ComputedRef<string[]>`
- 默认值：`[]`

忽略缓存的标签页列表。

#### keepAlive

- 类型：`ComputedRef<string[]>`
- 默认值：`[]`

缓存的路由。

#### updateKeepAliveInclude

- 类型：`() => void`

根据标签页数据更新缓存的标签页数据。

#### reload

- 类型：`() => void`

刷新页面。

#### asideWidth

- 类型：`Ref<number>`
- 默认值：`220`

侧边菜单宽度。

#### collapsedAsideWidth

- 类型：`Ref<number>`
- 默认值：`64`

折叠时侧边栏菜单宽度。

#### snugAsideWidth

- 类型：`Ref<number>`
- 默认值：`85`

紧凑侧边菜单宽度。

#### sidebarWidth

- 类型：`ComputedRef<number>`

侧边栏宽度。

#### topbarHeight

- 类型：`Ref<number>`
- 默认值：`48`

顶部栏高度。

#### tabbarHeight

- 类型：`Ref<number>`
- 默认值：`41`

标签栏高度。

#### headerHeight

- 类型：`ComputedRef<number>`
- 默认值：`41`

头部高度，等于顶部栏高度 + 标签栏高度。
