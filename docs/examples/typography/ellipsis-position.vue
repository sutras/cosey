<template>
  <div class="stack">
    <div class="block">
      <p class="label">结尾（默认）</p>
      <co-typography-paragraph :text="path" :ellipsis="{ rows: 1, expandable: true }" />
    </div>

    <div class="block">
      <p class="label">开头：保留结尾，适合路径、文件名</p>
      <co-typography-paragraph
        :text="path"
        :ellipsis="{ rows: 1, symbolPosition: 'head', expandable: true }"
      />
    </div>

    <div class="block">
      <p class="label">中间：头尾各留一半，适合长 ID、版本号</p>
      <co-typography-paragraph
        :text="serial"
        :ellipsis="{ rows: 1, symbolPosition: 'middle', expandable: true }"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const path = ref(
  '/Users/example/projects/design-system/packages/components/src/typography/index.tsx',
);

const serial = ref('SO-2025-1024-0001-a8f3c9d2-71be-4c0a-9f5e-2d6b8a1c4e70');
</script>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.block {
  max-width: 320px;
}

.label {
  margin: 0 0 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
