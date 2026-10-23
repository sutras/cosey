<template>
  <co-descriptions title="订单信息" bordered :column="2">
    <co-descriptions-item label="订单号" tooltip="下单后自动生成，不可修改">
      1024
    </co-descriptions-item>
    <co-descriptions-item label="状态">已支付</co-descriptions-item>
    <co-descriptions-item label="收货人">李四</co-descriptions-item>
    <co-descriptions-item label="联系电话">138 0000 6021</co-descriptions-item>
    <co-descriptions-item label="收货地址" :span="2">
      上海市徐汇区漕河泾开发区 28 号楼 1602 室
    </co-descriptions-item>
    <co-descriptions-item label="备注" :span="2">工作日送达，放门卫处即可。</co-descriptions-item>
  </co-descriptions>
</template>
