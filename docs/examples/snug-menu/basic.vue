<template>
  <div style="width: 80px">
    <co-snug-menu v-model="active">
      <co-snug-menu-item
        v-for="item in menus"
        :key="item.name"
        :name="item.name"
        :icon="item.icon"
        :title="item.title"
      />
    </co-snug-menu>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const menus = [
  {
    name: 'users',
    icon: 'carbon:user-admin',
    title: '用户管理',
  },
  {
    name: 'roles',
    icon: 'carbon:user-role',
    title: '角色管理',
  },
  {
    name: 'permissions',
    icon: 'carbon:rule-locked',
    title: '权限管理',
  },
];

const active = ref('users');
</script>
