<template>
  <co-editor v-model="value" :toolbar="toolbar" placeholder="请输入" />
</template>

<script lang="ts" setup>
import { ref } from 'vue';

// `,` 分隔按钮，`|` 分隔按钮组；这里只保留一套精简工具
const toolbar =
  'undo,redo|heading|bold,italic,underline,color|bulleted-list,align-left,align-right|link|source';

const value = ref(
  '<p>工具栏只显示 <strong>toolbar</strong> 里配置、且已在 <code>features</code> 中启用的按钮。</p>',
);
</script>
