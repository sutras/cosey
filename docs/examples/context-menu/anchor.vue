<template>
  <div class="demo">
    <div class="row">
      <div ref="anchorRef" class="anchor">锚点元素</div>
      <el-button @click="openMenu">在锚点右侧打开</el-button>
    </div>

    <p class="hint">菜单固定在左侧元素旁，元素位置变化时会跟着走。</p>

    <co-context-menu
      ref="menuRef"
      trigger="manual"
      :virtual-ref="virtualRef"
      placement="right-start"
      :offset="8"
      :lock-scroll="false"
      @command="onCommand"
    >
      <co-context-menu-item icon="bi bi-pencil" title="编辑" command="edit" />
      <co-context-menu-item icon="bi bi-files" title="复制一份" command="duplicate" />
      <co-context-menu-item divided icon="bi bi-trash" title="删除" command="delete" />
    </co-context-menu>
  </div>
</template>

<script lang="ts" setup>
import { type ContextMenuExpose } from 'cosey/components';
import { ElMessage } from 'element-plus';
import { computed, useTemplateRef } from 'vue';

const anchorRef = useTemplateRef<HTMLElement>('anchorRef');
const menuRef = useTemplateRef<ContextMenuExpose>('menuRef');

const virtualRef = computed(() => {
  const el = anchorRef.value;

  return el ? { getBoundingClientRect: () => el.getBoundingClientRect() } : null;
});

const openMenu = () => {
  menuRef.value?.open();
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

.row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.anchor {
  display: flex;
  align-items: center;
  height: 32px;
  padding-inline: 12px;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  user-select: none;
}

.hint {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
