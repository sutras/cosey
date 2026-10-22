<template>
  <co-week-range-picker v-model="value" />

  <div class="mt-2">{{ display }}</div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import { computed, ref } from 'vue';

/** 2025 第 52 周 ~ 2026 第 2 周：值跨年，打开面板锚到 2025 Q4，点 › 可看到另一半 */
const value = ref<Date[] | null>([new Date(2025, 11, 22), new Date(2026, 0, 11)]);

const display = computed(() =>
  value.value?.map((item) => dayjs(item).format('YYYY-MM-DD')).join(' ~ '),
);
</script>
