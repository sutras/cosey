# 认证与授权

认证与授权是一个后台系统最基础的功能。

Cosey 对其进行抽象，并提供了开箱即用的模板和简单易用的接口来进行配置。

## 认证

Cosey 提供了最基础认证方式（账号密码），如果需要其他的认证方式，可参考[登录页布局模板](https://github.com/sutras/cosey/blob/main/packages/cosey/layout/layout-login/layout-login.vue)进行修改，并进行配置以覆盖默认的布局组件，详情可参阅[布局章节](./layout)。

### 接口配置

Cosey 封装了认证流程：

```
        token
1.登录 --------> 2.初始化数据（获取用户信息、授权、添加路由）-> 3.跳转到首页
```

可以看到，登录和用户信息接口是基础且必须的，需要在 `launch` 函数配置项 `api` 进行配置：

```ts [main.ts]
import { launch } from 'cosey';
import authApi from '@/api/auth';

launch(app, {
  api: {
    login: authApi.login,
    getUserInfo: authApi.getUserInfo,
  },
});
```

- 登录接口必须返回一个 `token` 字符串；
- 用户信息接口至少要返回 `avatar` 和 `nickname` 字段数据，以便用于展示，如果名称不一致，需要进行转换。
- 如果没有用户信息接口，仅通过登录接口获取用户信息，在这种情况下，可以将登录时获取的用户信息保存到本地缓存，在 getUserInfo 中再读取本地缓存的值来返回。

### 修改密码

修改密码是可选的，如果提供了修改密码功能，需要配置对应的接口：

```ts
launch(app, {
  api: {
    changePassword: authApi.changePassword,
  },
});
```

### 退出登录

退出登录会清空认证信息并回到登录页，如果需要与服务端通信，也可以提供退出登录接口：

```ts
launch(app, {
  api: {
    logout: authApi.logout,
  },
});
```

## 授权

前端的授权主要是对路由和页面元素隐藏进行处理。

### 权限配置

`launch` 函数提供了配置项 `defineAuthority` 用于定义权限信息，此函数会在上面的认证流程步骤3调用，接收登录用户信息，具体权限处理全凭开发者， Cosey 并不关心。

```ts
launch(app, {
  defineAuthority(userInfo) {
    // userInfo
  },
});
```

### 路由过滤

配置完权限信息，接下来就是认证流程步骤4（动态添加路由）。

Cosey 提供了一个配置项 `filterRoute` 用于过滤路由，此函数接收 `RouteRecordRaw` 路由对象，只有返回 `truthy` 才会添加此路由。

```ts
launch(app, {
  filterRoute(route) {
    // 根据用户信息判断此路由是否通过
  },
});
```

同样，Cosey 并不关心具体判断逻辑。

`defineAuthority` 和 `filterRoute` 配置项就是 Cosey 对外进行权限管理的全部了。

## casl

`create-cosey` 搭建的项目推荐使用 [casl](https://casl.js.org/v6/en/guide/intro) 进行权限管理。

下面演示如何将其与 Cosey 结合使用：

首先是安装 `@casl/ability` 和 `@casl/vue` 包。

然后创建 `ability` 实例：

```ts [main.ts]
import { AbilityBuilder, createMongoAbility, defineAbility } from '@casl/ability';
import { ABILITY_TOKEN } from '@casl/vue';

const ability = defineAbility(() => {});
// 绑定方法以便可以在组件中扩展
ability.can = ability.can.bind(ability);
ability.cannot = ability.cannot.bind(ability);
// 全局注入以便在模板中使用
app.provide(ABILITY_TOKEN, ability);
```

权限注册：

```ts
import { AbilityBuilder, createMongoAbility } from '@casl/ability';

launch(app, {
  defineAuthority({ permissions = [] }) {
    // 假设 permissions 是包含在用户信息的权限列表
    const { can, rules } = new AbilityBuilder(createMongoAbility);
    permissions.forEach(({ action, subject }: any) => {
      can(action, subject);
    });
    ability.update(rules);
  },
});
```

路由定义：

```ts
{
  meta: {
    authority: (ability) => ability.can('read', 'article'),
  },
};
```

路由过滤：

```ts
launch(app, {
  filterRoute(route) {
    // 假设路由 meta 有配置 authority 函数
    const authority = route.meta?.authority;
    return !authority ? true : authority(ability);
  },
});
```

按钮的权限：

```html
<template>
  <el-button v-if="can('edit', 'article')">编辑</el-button>
</template>

<script lang="ts" setup>
  import { useAbility } from '@casl/vue';
  const { can, cannot } = useAbility();
</script>
```

## useUserStore

`useUserStore` 管理着认证和授权相关的全局状态和操作，在自定义布局中你可能需要用到。

### 使用

```ts
import { useUserStore } from 'cosey/store';

const userStore = useUserStore();

console.log(userStore.userInfo?.nickname);
```

### 接口

#### userInfo

- 类型：`UserInfo`
- 默认值：`-`

```ts
interface UserInfo {
  nickname: string;
  avatar: string;
  [key: PropertyKey]: any;
}
```

用户信息接口返回的数据。

#### login

- 类型：`(data: any) => Promise<void>`

登录操作。

#### initializeData

- 类型：`() => Promise<void>`

初始化数据。

#### changePassword

- 类型：`(data: any) => Promise<void>`

修改用户密码操作。

#### logout

- 类型：`(lastPath?: string) => Promise<void>`

退出操作。
