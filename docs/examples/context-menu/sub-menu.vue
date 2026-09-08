<template>
  <co-context-menu @command="onCommand">
    <template #reference>
      <el-button class="m-2">子菜单</el-button>
    </template>

    <co-context-menu-item icon="bi bi-copy" title="复制" command="copy" />
    <co-context-menu-item title="粘贴" command="paste" />
    <co-context-sub-menu divided title="分享到">
      <co-context-menu-item title="微信" command="ShareAppMessage" />
      <co-context-menu-item divided title="朋友圈" command="ShareTimeline" />
      <co-context-menu-item title="qq" command="QQ" />
    </co-context-sub-menu>
  </co-context-menu>
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus';

const onCommand = (command: any) => {
  ElMessage(command);
};
</script>
