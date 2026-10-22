<template>
  <co-remote-select
    v-model="value"
    :api="getUsers"
    :props="{ label: 'name', value: 'id' }"
    searchable
    search-param="name"
    placeholder="输入姓名搜索"
  />
</template>

<script lang="ts" setup>
import usersApi from '@/api/users';
import { ref } from 'vue';

const { getUsers } = usersApi;

const value = ref();
</script>
