<template>
  <co-week-range-picker v-model="value" :shortcuts="shortcuts" />

  <div class="mt-2">{{ display }}</div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import { computed, ref } from 'vue';

const value = ref<Date[] | null>(null);

/** 传 `[]` 可以收起内置的「本周 / 上周 / 近 4 周 / 本月 / 本年」 */
const shortcuts = [
  { text: 'Q1', value: () => [new Date(2026, 0, 1), new Date(2026, 2, 31)] as [Date, Date] },
  { text: 'Q2', value: () => [new Date(2026, 3, 1), new Date(2026, 5, 30)] as [Date, Date] },
  { text: 'Q3', value: () => [new Date(2026, 6, 1), new Date(2026, 8, 30)] as [Date, Date] },
  { text: 'Q4', value: () => [new Date(2026, 9, 1), new Date(2026, 11, 31)] as [Date, Date] },
];

const display = computed(() => {
  if (!value.value) return '未选择';

  return value.value.map((item) => dayjs(item).format('YYYY-MM-DD')).join(' ~ ');
});
</script>
