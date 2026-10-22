<template>
  <co-chart :option="option" :height="300" toolbar />
</template>

<script lang="ts" setup>
const option = {
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 16, top: 32, bottom: 32 },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: '访问量',
      type: 'line',
      smooth: true,
      areaStyle: {},
      data: [820, 932, 901, 934, 1290, 1330, 1320],
    },
  ],
};
</script>
