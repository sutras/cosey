<template>
  <co-card title="订单 A20241102001" sub-title="2024-11-02 10:24 下单">
    <template #extra>
      <el-tag size="small" type="success">已发货</el-tag>
    </template>

    <div class="goods">
      <span class="name">云音乐会员年卡</span>
      <span class="qty">× 1</span>
      <span class="price">¥ 168.00</span>
    </div>

    <div class="group">
      <co-card type="inner" title="收货信息">
        <p class="line">上海市徐汇区漕河泾开发区 28 号楼 1601 · 张明 · 138 0000 6021</p>
      </co-card>

      <co-card type="inner" title="物流进度">
        <p class="line">顺丰速运 SF1029384756 · 11-03 09:12 已签收</p>
      </co-card>
    </div>
  </co-card>
</template>

<script lang="ts" setup></script>

<style scoped>
.goods {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding-bottom: 12px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.name {
  flex: 1;
  min-width: 0;
  color: var(--el-text-color-primary);
}

.qty {
  color: var(--el-text-color-secondary);
}

.price {
  font-variant-numeric: tabular-nums;
}

.group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.line {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-regular);
}
</style>
