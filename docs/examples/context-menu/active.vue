<template>
  <div class="demo">
    <co-context-menu @command="onSelect">
      <template #reference>
        <div class="area">
          <span class="current">当前对齐：{{ currentLabel }}</span>
          <span class="hint">在区域内点击鼠标右键切换</span>
        </div>
      </template>

      <co-context-menu-item
        v-for="option in options"
        :key="option.value"
        :icon="option.icon"
        :title="option.title"
        :command="option.value"
        :active="current === option.value"
      />
    </co-context-menu>

    <p class="text" :style="{ textAlign: current }">这段文字的对齐方式会跟随菜单里选中的那一项。</p>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';

const options = [
  { value: 'left', title: '左对齐', icon: 'bi bi-text-left' },
  { value: 'center', title: '居中对齐', icon: 'bi bi-text-center' },
  { value: 'right', title: '右对齐', icon: 'bi bi-text-right' },
  { value: 'justify', title: '两端对齐', icon: 'bi bi-justify' },
];

const current = ref('left');

const currentLabel = computed(
  () => options.find((option) => option.value === current.value)?.title ?? '',
);

const onSelect = (command: string) => {
  current.value = command;
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
  flex-direction: column;
  gap: 4px;
  width: 320px;
  padding: 12px;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  user-select: none;
}

.current {
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.text {
  width: 320px;
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-regular);
}
</style>
