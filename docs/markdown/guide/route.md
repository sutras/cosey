# 路由与菜单

在调用 `launch` 函数时，会根据所传参数自动创建路由，并且根据路由创建菜单，路由和菜单属于映射关系，没有添加的路由也不会生成对应菜单。

## 路由类型

路由可以分为核心路由和自定义路由，自定义路由由用户定义，又可以分为静态路由和动态路由。

### 核心路由

核心路由包括登录、重置密码、404等，是系统内置的必要的，会在创建路由对象时就添加的路由。

### 静态路由

静态路由会在创建路由对象时就添加。主要用于不经过身份验证就能进行访问，例如“登录”路由；当然，也可以设置让其必须经过身份验证才能访问，例如“重置密码”路由。

可以在 `src/routes/static` 目录下定义。

### 动态路由

动态路由需要经过身份验证才添加，这时还可以根据用户权限对要添加的路由进行过滤。

可以在 `src/routes/dynamic` 目录下定义。

## 路由定义

可通过 `defineRoutes` 来定义路由，此函数主要用来设置默认的 meta 值和 name，以及提供类型提示，返回的路由和 `RouteRecordRaw` 完全兼容。

### 一级菜单路由定义

下面定义了一个一级菜单路由，路由访问地址为 `/users`，处于内置的 `LayoutBase` 布局结构中，设置了 `flatChildrenInMenu` 使其在菜单中进行打平。

```ts
import { defineRoutes, LayoutBase } from 'cosey';

export default defineRoutes({
  path: '/',
  component: LayoutBase,
  meta: {
    flatChildrenInMenu: true,
  },
  children: [
    {
      path: 'users',
      name: 'Users',
      component: () => import('@/views/users/index.vue'),
      meta: {
        title: '用户管理',
        icon: 'bi bi-person',
      },
    },
  ],
});
```

### 二级菜单路由

下面定义了一个二级菜单路由，路由访问地址为 `/blog/posts`，同样处于内置的 `LayoutBase` 布局结构中。

如果没有定义 `redirect`, 当访问 `/blog` 时，会自动重定向到第一个子路由，即 `/blog/posts`。

```ts
import { defineRoutes, LayoutBase } from 'cosey';

export default defineRoutes({
  path: '/blog',
  name: 'Blog',
  component: LayoutBase,
  meta: {
    title: '博客管理',
    icon: 'bi bi-journal-richtext',
  },
  children: [
    {
      path: 'posts',
      name: 'BlogPosts',
      component: () => import('@/views/blog/posts/index.vue'),
      meta: {
        title: '文章管理',
        icon: 'bi bi-file-earmark-text',
      },
    },
  ],
});
```

### 多级路由

可在二级路由基础上继续嵌套任意层级路由。

## 路由注册

`launch` 函数配置项 `router` 用于注册路由，继承于 `RouterConfig` 并通过 `dynamic` 注册动态路由，通过 `static` 注册静态路由。

```ts
import { launch } from 'cosey';
import { createWebHistory } from 'vue-router';
import { dynamicRoutes, staticRoutes } from '@/routes';

launch(app, {
  router: { dynamic: dynamicRoutes, static: staticRoutes, history: createWebHistory() },
});
```

## 路由配置

Cosey 扩展了 `vue-router` 路由对象的 `meta` 属性，同时可自动获得类型提示。

### title

- 类型：`string`
- 默认值：`undefined`

用于配置页面的标题，会在菜单和标签页中显示。

### icon

- 类型：`string`
- 默认值：`undefined`

用于配置页面的图标，会在菜单和标签页中显示，配置的值会传入 `Icon` 组件的 `name` 属性。

### hideInMenu

- 类型：`boolean`
- 默认值：`false`

是否在菜单中隐藏，隐藏后不会在菜单中显示，包括子菜单和后代菜单。

### hideChildrenInMenu

- 类型：`boolean`
- 默认值：`false`

是否在菜单中隐藏子级菜单，隐藏后不会在菜单中显示，包括子菜单的后代菜单。此配置的主要作用是可以将子菜单渲染到页面中。

### flatChildrenInMenu

- 类型：`boolean`
- 默认值：`false`

打平子级菜单，只显示子级菜单，不显示父菜单。

### type

- 类型：`group`
- 默认值：`undefined`

菜单类型，可以将菜单项进行编组。

### closable

- 类型：`boolean`
- 默认值：`true`

是否可在标签页中关闭。为了避免关闭所有标签页时出现空白，通常首页路由会将此配置设为 false。

### keepAlive

- 类型：`boolean`
- 默认值：`true`

是否缓存页面。

### order

- 类型：`number`
- 默认值：`0`

菜单排序，升序。

### iframeSrc

- 类型：`string`
- 默认值：`undefined`

内嵌到当前页面的 iframe 地址

### authentication

- 类型：`boolean`
- 默认值：`true`

是否需要经过身份验证才能访问，主要用于静态路由中。

### authority

- 类型：`(ability: AnyAbility) => boolean`
- 默认值：`undefined`

在菜单权限管理中，这是一个可选的配置，主要是预置一个权限的类型提示，完全可以在 meta 下定义其他的属性来配置权限。
