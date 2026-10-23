<template>
  <co-context-menu trigger="click" @command="onCommand">
    <template #reference>
      <el-button>左键点击打开</el-button>
    </template>

    <co-context-menu-item icon="bi bi-pencil" title="重命名" command="rename" />
    <co-context-menu-item icon="bi bi-download" title="下载" command="download" />
    <co-context-menu-item divided icon="bi bi-trash" title="删除" command="delete" />
  </co-context-menu>
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus';

const onCommand = (command: string) => {
  ElMessage.success(`执行：${command}`);
};
</script>
