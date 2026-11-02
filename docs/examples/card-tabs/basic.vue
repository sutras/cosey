<template>
  <co-card-tabs v-model="active" title="订单 A20241102001" collapsible>
    <template #extra>
      <el-button size="small">打印</el-button>
    </template>

    <co-card-tab-panel name="base" label="基本信息">
      <div class="rows">
        <div class="row">
          <span>下单时间</span>
          <span>2024-11-02 10:24</span>
        </div>
        <div class="row">
          <span>客户</span>
          <span>张明 · 138 0000 6021</span>
        </div>
        <div class="row">
          <span>收货地址</span>
          <span>上海市徐汇区漕河泾开发区 28 号楼 1601</span>
        </div>
        <div class="row">
          <span>支付方式</span>
          <span>微信支付</span>
        </div>
      </div>
    </co-card-tab-panel>

    <co-card-tab-panel name="goods" label="商品">
      <div class="rows">
        <div class="row">
          <span>云音乐会员年卡</span>
          <span>× 1 · ¥ 168.00</span>
        </div>
        <div class="row">
          <span>蓝牙耳机 Pro</span>
          <span>× 2 · ¥ 598.00</span>
        </div>
      </div>
    </co-card-tab-panel>

    <co-card-tab-panel name="logs" label="操作日志" lazy>
      <div class="rows">
        <div class="row">
          <span>11-03 09:12 已签收</span>
          <span>系统</span>
        </div>
        <div class="row">
          <span>11-02 16:40 已发货</span>
          <span>王建国</span>
        </div>
        <div class="row">
          <span>11-02 10:24 创建订单</span>
          <span>张明</span>
        </div>
      </div>
    </co-card-tab-panel>

    <co-card-tab-panel name="invoice" label="发票" disabled>
      <p class="empty">开票后可见</p>
    </co-card-tab-panel>
  </co-card-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const active = ref('base');
</script>

<style scoped>
.rows {
  display: flex;
  flex-direction: column;
}

.row {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding-block: 6px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.row > span:first-child {
  color: var(--el-text-color-secondary);
}

.empty {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>
