<template>
  <div class="stack">
    <co-descriptions title="标签在上（无边框）" layout="vertical" :column="2">
      <co-descriptions-item label="商品">云数据库</co-descriptions-item>
      <co-descriptions-item label="计费方式">按量付费</co-descriptions-item>
      <co-descriptions-item label="自动续费">是</co-descriptions-item>
      <co-descriptions-item label="到期时间">2025-11-20</co-descriptions-item>
    </co-descriptions>

    <co-descriptions title="标签在上（有边框）" layout="vertical" bordered :column="2">
      <co-descriptions-item label="商品">云数据库</co-descriptions-item>
      <co-descriptions-item label="计费方式">按量付费</co-descriptions-item>
      <co-descriptions-item label="自动续费">是</co-descriptions-item>
      <co-descriptions-item label="到期时间">2025-11-20</co-descriptions-item>
    </co-descriptions>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
</style>
