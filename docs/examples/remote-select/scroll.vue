<template>
  <co-remote-select
    v-model="value"
    :api="getProducts"
    :props="{ label: 'name', value: 'id' }"
    pagination="scroll"
    searchable
    placeholder="输入商品名/编码搜索，滚动到底部加载更多"
  />
</template>

<script lang="ts" setup>
import productsApi from '@/api/products';
import { ref } from 'vue';

const { getProducts } = productsApi;

const value = ref();
</script>
