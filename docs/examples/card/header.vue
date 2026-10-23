<template>
  <div class="stack">
    <co-card title="月活趋势" sub-title="最近 7 天" tooltip="数据每小时更新一次">
      <template #extra>
        <el-button link type="primary">查看详情</el-button>
      </template>
      <p>标题、副标题、标题右侧的提示与操作区。</p>
    </co-card>

    <co-card size="small" title="小尺寸">
      <p>size 为 small</p>
    </co-card>

    <co-card title="点击箭头图标折叠" collapsible>
      <p>collapsible 为 true/icon 时，点击图标会折叠。</p>
    </co-card>

    <co-card title="点击标题区折叠" collapsible="header" box-shadow>
      <p>collapsible 为 header 时，整个标题区都可以点击折叠。</p>
    </co-card>

    <co-card variant="borderless" title="无边框" hoverable>
      <p>variant 为 borderless。当添加 hoverable 时，鼠标移入会浮起。</p>
    </co-card>

    <co-card title="订单 #1024" sub-title="内嵌卡片用于在卡片内部再分区" type="inner">
      <template #extra>
        <el-tag size="small" type="success">已支付</el-tag>
      </template>

      <p class="line">2019 秋冬系列 · 2 件商品 · 合计 ¥ 1,280.00</p>

      <div class="group">
        <co-card type="inner" title="收货信息">
          <p>上海市徐汇区漕河泾开发区 28 号楼 · 张先生 · 138 0000 6021</p>
        </co-card>

        <co-card type="inner" title="物流进度">
          <p>顺丰速运 SF1029384756 · 已签收</p>
        </co-card>
      </div>
    </co-card>
  </div>
</template>

<script lang="ts" setup></script>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.line {
  margin: 0 0 12px;
}

.group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
