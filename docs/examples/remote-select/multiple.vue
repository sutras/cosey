<template>
  <co-remote-select
    v-model="value"
    multiple
    collapse-tags
    searchable
    search-param="name"
    :api="getUsers"
    :props="{ label: 'name', value: 'id' }"
    placeholder="输入姓名搜索，可翻页连续选择"
  />
</template>

<script lang="ts" setup>
import usersApi from '@/api/users';
import { ref } from 'vue';

const { getUsers } = usersApi;

const value = ref();
</script>
