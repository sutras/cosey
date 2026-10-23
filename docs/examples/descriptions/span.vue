<template>
  <co-descriptions title="列数与跨列" :column="3">
    <co-descriptions-item label="订单号">1024</co-descriptions-item>
    <co-descriptions-item label="金额">¥ 1,280.00</co-descriptions-item>
    <co-descriptions-item label="状态">已支付</co-descriptions-item>
    <co-descriptions-item label="下单时间">2025-10-20 14:32</co-descriptions-item>
    <co-descriptions-item label="支付方式" :span="2">微信支付</co-descriptions-item>
    <co-descriptions-item label="收货地址" :span="3">
      上海市徐汇区漕河泾开发区 28 号楼 1602 室
    </co-descriptions-item>
  </co-descriptions>
</template>
