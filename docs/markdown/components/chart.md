# Chart 图表

## 简介

`useEcharts` 的组件化封装：自动初始化、跟随容器尺寸、主题与暗色模式联动，另外补上加载态、空状态和导出图片。

## 代码演示

### 基础使用

::: demo

chart/basic

:::

### 加载与空数据

```vue
<co-chart :option="option" :loading="loading" :empty="!option" height="320px" />
```

## API

### ChartProps

| 属性            | 描述                                                        | 类型             | 默认值      |
| --------------- | ----------------------------------------------------------- | ---------------- | ----------- |
| option          | echarts 配置                                                | ECOption         | -           |
| height          | 高度                                                        | string \| number | 320         |
| loading         | 加载态                                                      | boolean          | false       |
| loadingText     | 加载文案                                                    | string           | 加载中      |
| empty           | 空状态                                                      | boolean          | false       |
| emptyText       | 空状态文案                                                  | string           | 暂无数据    |
| skeleton        | 加载时用骨架屏替代图表                                      | boolean          | true        |
| toolbar         | 显示右上角导出图片按钮                                      | boolean          | false       |
| exportFilename  | 导出文件名，默认直接下载；传 `false` 时只触发 `export` 事件 | string \| false  | 'chart.png' |
| backgroundColor | 导出图片的背景色                                            | string           | transparent |
| merge           | `option` 变化时是否合并，`false` 表示整体替换               | boolean          | true        |

### ChartSlots

| 插槽    | 描述                    | 属性                                        |
| ------- | ----------------------- | ------------------------------------------- |
| default | 覆盖图例/水印等附加内容 | { chart: ECharts; exportImage: () => void } |

### CoChartEmits

| 事件   | 描述                         | 类型                  |
| ------ | ---------------------------- | --------------------- |
| export | 导出图片时触发，返回 dataURL | (url: string) => void |
