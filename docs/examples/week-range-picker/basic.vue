<template>
  <co-week-range-picker v-model="value" start-placeholder="开始" end-placeholder="结束" />

  <div class="mt-2">
    <el-button @click="onSetValue">选中 2026 第 5 ~ 11 周</el-button>
    <el-button @click="value = null">清空</el-button>
  </div>

  <div class="mt-2">{{ display }}</div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import { computed, ref } from 'vue';

const value = ref<Date[] | null>(null);

const onSetValue = () => {
  value.value = [new Date(2026, 0, 28), new Date(2026, 2, 8)];
};

const display = computed(
  () => value.value?.map((item) => dayjs(item).format('YYYY-MM-DD HH:mm:ss')) ?? '未选择',
);
</script>
