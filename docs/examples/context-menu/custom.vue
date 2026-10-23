<template>
  <div class="demo">
    <co-context-menu ref="menuRef" @command="onCommand">
      <template #reference>
        <div class="area">在虚线区域内点击鼠标右键</div>
      </template>

      <co-context-menu-item command="copy">
        <template #icon>
          <co-icon name="bi bi-files" />
        </template>
        <div class="item">
          <span>复制</span>
          <span class="kbd">⌘ C</span>
        </div>
      </co-context-menu-item>

      <co-context-menu-item command="paste">
        <template #icon>
          <co-icon name="bi bi-clipboard" />
        </template>
        <div class="item">
          <span>粘贴</span>
          <span class="kbd">⌘ V</span>
        </div>
      </co-context-menu-item>

      <co-context-menu-item divided :close-on-select="false">
        <template #icon>
          <co-icon name="bi bi-palette" />
        </template>
        <div class="item">
          <span>标签颜色</span>
          <span class="swatches">
            <button
              v-for="color in colors"
              :key="color"
              class="swatch"
              :style="{ backgroundColor: color }"
              @click.stop="pick(color)"
            />
          </span>
        </div>
      </co-context-menu-item>
    </co-context-menu>

    <p class="hint">前两项带快捷键提示；颜色项点了不会自动关菜单，选完颜色才手动关闭。</p>
  </div>
</template>

<script lang="ts" setup>
import { type ContextMenuExpose } from 'cosey/components';
import { ElMessage } from 'element-plus';
import { useTemplateRef } from 'vue';

const menuRef = useTemplateRef<ContextMenuExpose>('menuRef');

const colors = ['#f56c6c', '#e6a23c', '#67c23a', '#409eff'];

const onCommand = (command: string) => {
  ElMessage.success(`执行：${command}`);
};

const pick = (color: string) => {
  ElMessage.success(`标签颜色设为 ${color}`);
  menuRef.value?.close();
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

.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.kbd {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.swatches {
  display: flex;
  gap: 6px;
}

.swatch {
  width: 14px;
  height: 14px;
  padding: 0;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

.hint {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
