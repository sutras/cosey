<template>
  <co-week-range-picker v-model="value" :disabled-week="disabledWeek" />

  <div class="mt-2">{{ display }}</div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import { computed, ref } from 'vue';

const value = ref<Date[] | null>(null);

/** 今天之后的周不可选 */
const disabledWeek = ({ start }: { start: Date }) => dayjs(start).isAfter(dayjs(), 'week');

const display = computed(() => {
  if (!value.value) return '未选择';

  return value.value.map((item) => dayjs(item).format('YYYY-MM-DD')).join(' ~ ');
});
</script>
