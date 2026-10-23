<template>
  <div class="demo">
    <co-context-menu @command="onCommand" @open="openCount += 1" @close="closeCount += 1">
      <template #reference>
        <div class="area">在虚线区域内点击鼠标右键</div>
      </template>

      <co-context-menu-item icon="bi bi-files" title="复制" command="copy" />
      <co-context-menu-item icon="bi bi-clipboard" title="粘贴" command="paste" />
      <co-context-menu-item icon="bi bi-scissors" title="剪切" command="cut" />
      <co-context-menu-item divided icon="bi bi-trash" title="删除" command="delete" disabled />
      <co-context-menu-item icon="bi bi-check2-square" title="全选" command="selectAll" />
    </co-context-menu>

    <p class="hint">已打开 {{ openCount }} 次 · 已关闭 {{ closeCount }} 次（「删除」为禁用项）</p>
  </div>
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus';
import { ref } from 'vue';

const openCount = ref(0);
const closeCount = ref(0);

const commandText: Record<string, string> = {
  copy: '复制',
  paste: '粘贴',
  cut: '剪切',
  delete: '删除',
  selectAll: '全选',
};

const onCommand = (command: string) => {
  ElMessage.success(`执行：${commandText[command] ?? command}`);
};
</script>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.area {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 320px;
  height: 96px;
  padding: 12px;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  color: var(--el-text-color-secondary);
  user-select: none;
}

.hint {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
