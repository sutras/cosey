<template>
  <div class="demo">
    <el-button @click="onClick">在鼠标位置打开</el-button>

    <p class="hint">调用 open(x, y) 传入坐标，菜单出现在指定位置。</p>

    <co-context-menu ref="contextMenuRef" @command="onCommand">
      <co-context-menu-item icon="bi bi-files" title="复制" command="copy" />
      <co-context-menu-item icon="bi bi-clipboard" title="粘贴" command="paste" />
    </co-context-menu>
  </div>
</template>

<script lang="ts" setup>
import { type ContextMenuExpose } from 'cosey/components';
import { ElMessage } from 'element-plus';
import { useTemplateRef } from 'vue';

const contextMenuRef = useTemplateRef<ContextMenuExpose>('contextMenuRef');

const onClick = (event: MouseEvent) => {
  contextMenuRef.value?.open(event.clientX, event.clientY);
};

const onCommand = (command: string) => {
  ElMessage.success(`执行：${command}`);
};
</script>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.hint {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
