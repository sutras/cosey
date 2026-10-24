<template>
  <div class="stack">
    <p class="label">
      不传 code，直接把代码放进默认插槽（同
      <code>code</code>
      ，取纯文本）
    </p>
    <co-highlight lang="bash">{{ script }}</co-highlight>
  </div>
</template>

<script lang="ts" setup>
const script = `#!/usr/bin/env bash
set -euo pipefail

VERSION=$(node -p "require('./package.json').version")

echo "building cosey@$VERSION"
pnpm build

git tag "v$VERSION"
git push origin "v$VERSION"`;
</script>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.label {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
