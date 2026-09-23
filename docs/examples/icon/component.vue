<template>
  <co-icon size="sm">
    <rti-bold />
  </co-icon>
  <co-icon :size="24">
    <rti-italic />
  </co-icon>
  <co-icon size="xl" style="color: var(--el-color-primary)">
    <rti-underline />
  </co-icon>
</template>

<script lang="ts" setup>
import { RtiBold, RtiItalic, RtiUnderline } from 'richtext-icons';
</script>
