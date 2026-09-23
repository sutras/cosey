# Icon 图标

## 简介

Cosey 中所有展示图标的地方都会使用 Icon 组件，包括标签栏、菜单栏和页面其他地方。

图标数据来源有四个，一是 [iconify](https://github.com/iconify/iconify)，二是本地的 svg 文件，三是图标字体，四是直接使用图标组件。

### iconify

下面演示如何安装 element-plus 官方图标集。

先安装 `@iconify-json/ep`。

再进行注册：

```ts
import { icons as epIcons } from '@iconify-json/ep';
import { addIconifyIcon } from 'cosey/components';

addIconifyIcon('ep', epIcons);
```

使用：

```tsx
<Icon name="ep:avatar" />
```

### 本地 svg 图标

如果 iconify 不能满足需求，觉得引入的包太大，或者想引入定制性的图标。可以将 svg 文件放在 `src/assets/icons` 目录。

`create-cosey` 在 `vite.config.ts` 配置了 `vite-plugin-svg-icons` 插件，会将此目录下的 svg 文件自动打包在一起。

假如此目录下有一个 `vite.svg` 文件，可以这样使用：

```tsx
<Icon name="svg:vite" />
```

`name` 以 `svg:` 开头的图标就是引用 `src/assets/icons` 目录下的图标。

### 字体图标

`Icon` 组件也支持字体图标。

先加载字体图标资源，可以直接在 html 引入：

```html
<link
  rel="stylesheet"
  href="https://netdna.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
/>
```

也可以下载到本地并导入：

```js [main]
import '@/style/font-awesome.min.css';
```

然后就可以使用了：

```tsx
<Icon name="fa fa-tachometer" />
```

### 直接使用图标组件

前面三种方式都是通过 `name` 指定图标。如果手里已经有一个图标组件，可以直接放进 `Icon` 的默认插槽——[richtext-icons](https://richtext-icons.wzt.zone/) 是本库的依赖，Cosey 内部组件（如 `Close`）就是用它来渲染图标的：

```ts
import { RtiClose } from 'richtext-icons';
```

```tsx
<Icon>
  <RtiClose />
</Icon>
```

传了默认插槽后 `name` 会被忽略，`Icon` 只负责外层容器，尺寸和颜色仍由它统一控制：图标组件按 `1em` 设置宽高、用 `currentColor` 作为颜色，就会自动跟随 `Icon` 的 `size` 与当前文字颜色。

## 代码演示

### Iconify

::: demo

icon/basic

:::

### SvgIcon

::: demo

icon/svg-icon

:::

### FontIcon

::: demo

icon/font-icon

:::

### 图标组件

::: demo

icon/component

:::

## API

### IconProps

| 属性 | 描述     | 类型                                             | 默认值 |
| ---- | -------- | ------------------------------------------------ | ------ |
| name | 图标名称 | string                                           | -      |
| size | 图标尺寸 | 'sm' \| 'md' \| 'lg' \| 'xl' \| number \| string | -      |

### IconSlots

| 插槽    | 描述                               | 属性 |
| ------- | ---------------------------------- | ---- |
| default | 自定义图标内容，可传入任意图标组件 | -    |
