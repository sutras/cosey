# 接口请求

cosey 对 `axios` 进行了封装，对外提供了 `http` 对象来发送请求。

## 定义接口

通常接口根据不同模块存放在不同的文件中，例如博客模块的接口，就可以这样存放和定义：

```ts [api/blog.ts]
import { http } from 'cosey';

const Api = {
  PostsResource: '/blog/posts',
};

export default {
  getPosts: (params?: any) => {
    return http.get(Api.PostsResource, {
      params,
    });
  },

  getPost: (id: number) => {
    return http.get(`${Api.PostsResource}/${id}`);
  },

  addPost: (data: any) => {
    return http.post(Api.PostsResource, data);
  },

  updatePost: (id: number, data: any) => {
    return http.patch(`${Api.PostsResource}/${id}`, data);
  },

  deletePost: (id: number) => {
    return http.delete(`${Api.PostsResource}/${id}`);
  },
};
```

上面定义了博客模块的 RESTful 风格的接口。

`http` 对象定义了多个方法，这些方法在 axios 方法接口基础上添加了一个参数，用于扩展 axios 的使用。

## 使用接口

```ts
import postsApi from '@/api/blog';

const { getPosts } = postsApi;

getPosts().then((data) => {
  console.log(data);
});
```

## 终止请求

```ts
import { http } from 'cosey';

const getInfo = (signal) => {
  return http.get('getUserInfo', {
    signal,
  });
};

const controller = new AbortController();

getInfo(controller.signal);

controller.abort();
```

## Refresh Token

cosey 支持双 token 认证，当 access token 过期后，可以使用 refresh token 来更新。

需要配置 `refreshToken` 用于获取刷新后的 access token；并且需要配置 `isAccessTokenExpired` 来区分 401 类型；

如果是 access token 过期，则会使用 refresh token 刷新 token；如果是 refresh token 过期则去到登录页。

```ts
import { persist } from 'cosey';

launch(app, {
  api: {
    login: async (data: any) => {
      const { accessToken, refreshToken } = await http.post('/auth/login', data);

      // 保存初始登录的 refresh token
      persist.set(REFRESH_TOKEN, refreshToken);

      // 返回 access token
      return accessToken;
    },

    refreshToken: async () => {
      const { accessToken, refreshToken } = await http.post('/auth/refresh-token', {
        refreshToken: persist.get('REFRESH_TOKEN'),
      });

      // 保存刷新后的 refresh token
      persist.set('REFRESH_TOKEN', refreshToken);

      // 返回 access token
      return accessToken;
    },

    isAccessTokenExpired: (response: AxiosResponse<any, any>) => {
      // 根据响应数据判断是否为 access token 过期（401 可能为 access token 过期或者 refresh token 过期）
      return response.data.data.type === 'accessToken';
    },
  },
});
```

## 接口配置

`launch` 函数配置项 `http` 用于接口相关的配置，类型为 `HttpConfig`。

### baseURL

- 类型：`string`
- 默认值：`''`

基础url。

### timeout

- 类型：`number`
- 默认值：`20 * 1000`

请求超时时间，单位 ms。

### headers

- 类型：`Record<string, string>`
- 默认值：`{}`

自定义请求头。

### authScheme

- 类型：`string`
- 默认值：`'Bearer'`

HTTP 认证方案。

### authHeaderKey

- 类型：`string`
- 默认值：`'Authorization'`

Token 添加到的请求头字段的键名

### path

#### path.code

- 类型：`string`
- 默认值：`'code'`

响应状态码属性的路径，通过 lodash.get 获取。

#### path.message

- 类型：`string`
- 默认值：`'message'`

响应信息属性的路径，通过 lodash.get 获取。

#### path.data

- 类型：`string`
- 默认值：`'data'`

响应数据对象属性的路径，通过 lodash.get 获取。

### code

#### code.success

- 类型：`number`
- 默认值：`200`

响应成功状态码。

#### code.unauthorized

- 类型：`number`
- 默认值：`401`

未认证状态码。

#### code.forbidden

- 类型：`number`
- 默认值：`403`

没权限状态码。

### errorDuration

- 类型：`number`
- 默认值：`3000`

错误提示显示时长，单位 ms。

### originalResponse

- 类型：`boolean`
- 默认值：`false`

是否直接返回 AxiosResponse 对象。

### originalData

- 类型：`boolean`
- 默认值：`false`

是否直接返回 AxiosResponse.data 属性值。

## 创建自定义 Http

除了使用默认的 `http` 对象，还可以根据配置创建自定义的请求对象。

```ts
import { createHttp } from 'cosey';

export const http = createHttp({
  baseURL: '/another-api',
});
```

### createHttp 接口

```ts
function createHttp(axiosConfig?: CreateAxiosDefaults<any>, createCfg?: HttpConfig): Http;
```

## Http 方法

### request

```ts
Http.request<T = any, D = any>(config: AxiosRequestConfig<D>, httpConfig?: HttpConfig): Promise<T>
```

### get

```ts
Http.get<T = any, D = any>(url: string, config?: AxiosRequestConfig<D> | undefined, httpConfig?: HttpConfig): Promise<T>
```

### delete

```ts
Http.delete<T = any, D = any>(url: string, config?: AxiosRequestConfig<D> | undefined, httpConfig?: HttpConfig): Promise<T>
```

### head

```ts
Http.head<T = any, D = any>(url: string, config?: AxiosRequestConfig<D> | undefined, httpConfig?: HttpConfig): Promise<T>
```

### options

```ts
Http.options<T = any, D = any>(url: string, config?: AxiosRequestConfig<D> | undefined, httpConfig?: HttpConfig): Promise<T>
```

### post

```ts
Http.post<T = any, D = any>(url: string, data?: D | undefined, config?: AxiosRequestConfig<D> | undefined, httpConfig?: HttpConfig): Promise<T>
```

### put

```ts
Http.put<T = any, D = any>(url: string, data?: D | undefined, config?: AxiosRequestConfig<D> | undefined, httpConfig?: HttpConfig): Promise<T>
```

### patch

```ts
Http.patch<T = any, D = any>(url: string, data?: D | undefined, config?: AxiosRequestConfig<D> | undefined, httpConfig?: HttpConfig): Promise<T>
```

## 配置覆盖规则

```
launch http 配置 <- createHttp 参数 <- Http 方法参数
```
