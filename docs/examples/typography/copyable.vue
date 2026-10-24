<template>
  <div class="stack">
    <co-typography-text copyable>订单号：SO-2025-1024-0001</co-typography-text>

    <co-typography-paragraph copyable :text="text" :ellipsis="{ rows: 2 }" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const text = ref(
  '大江东去，浪淘尽，千古风流人物。故垒西边，人道是：三国周郎赤壁。乱石穿空，惊涛拍岸，卷起千堆雪。江山如画，一时多少豪杰。',
);
</script>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 320px;
}
</style>
