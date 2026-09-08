<template>
  <co-context-menu @command="onCommand">
    <template #reference>
      <el-button class="m-2">点击鼠标右键触发</el-button>
    </template>

    <co-context-menu-item icon="bi bi-copy" title="复制" command="copy" />
    <co-context-menu-item title="粘贴" command="paste" />
  </co-context-menu>
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus';

const onCommand = (command: any) => {
  ElMessage(command);
};
</script>
