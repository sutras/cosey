<template>
  <div class="size-demo">
    <el-radio-group v-model="bordered" size="small">
      <el-radio-button :value="false">无边框</el-radio-button>
      <el-radio-button :value="true">有边框</el-radio-button>
    </el-radio-group>

    <co-descriptions title="large" size="large" :column="3" :bordered="bordered">
      <co-descriptions-item label="商品">云数据库</co-descriptions-item>
      <co-descriptions-item label="计费方式">按量付费</co-descriptions-item>
      <co-descriptions-item label="自动续费">是</co-descriptions-item>
      <co-descriptions-item label="到期时间">2025-11-20</co-descriptions-item>
      <co-descriptions-item label="区域">华东 1</co-descriptions-item>
      <co-descriptions-item label="实例规格">2 核 4G</co-descriptions-item>
    </co-descriptions>

    <co-descriptions title="medium（默认）" :column="3" :bordered="bordered">
      <co-descriptions-item label="商品">云数据库</co-descriptions-item>
      <co-descriptions-item label="计费方式">按量付费</co-descriptions-item>
      <co-descriptions-item label="自动续费">是</co-descriptions-item>
      <co-descriptions-item label="到期时间">2025-11-20</co-descriptions-item>
      <co-descriptions-item label="区域">华东 1</co-descriptions-item>
      <co-descriptions-item label="实例规格">2 核 4G</co-descriptions-item>
    </co-descriptions>

    <co-descriptions title="small" size="small" :column="3" :bordered="bordered">
      <co-descriptions-item label="商品">云数据库</co-descriptions-item>
      <co-descriptions-item label="计费方式">按量付费</co-descriptions-item>
      <co-descriptions-item label="自动续费">是</co-descriptions-item>
      <co-descriptions-item label="到期时间">2025-11-20</co-descriptions-item>
      <co-descriptions-item label="区域">华东 1</co-descriptions-item>
      <co-descriptions-item label="实例规格">2 核 4G</co-descriptions-item>
    </co-descriptions>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const bordered = ref(false);
</script>

<style scoped>
.size-demo {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
