<template>
  <co-form-item v-model="username" placeholder="请输入用户名" field-type="input" width="sm">
    <template #prefix>
      <co-icon name="bi bi-person" />
    </template>
  </co-form-item>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const username = ref('');
</script>
