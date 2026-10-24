<template>
  <div class="lang-demo">
    <el-radio-group v-model="lang" size="small">
      <el-radio-button value="ts">TypeScript</el-radio-button>
      <el-radio-button value="css">CSS</el-radio-button>
      <el-radio-button value="html">HTML</el-radio-button>
      <el-radio-button value="sql">SQL</el-radio-button>
      <el-radio-button value="bash">Bash</el-radio-button>
      <el-radio-button value="text">纯文本</el-radio-button>
    </el-radio-group>

    <co-highlight :code="samples[lang]" :lang="lang" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const lang = ref('ts');

const samples: Record<string, string> = {
  ts: `interface Column {
  key: string;
  width?: number;
}

export function pick<T extends object, K extends keyof T>(
  source: T,
  keys: K[],
): Pick<T, K> {
  return keys.reduce(
    (acc, key) => ({ ...acc, [key]: source[key] }),
    {} as Pick<T, K>,
  );
}

const column: Column = { key: 'createdAt', width: 160 };`,
  css: `.panel {
  display: flex;
  gap: 8px;
  padding: 16px;
  border-radius: 8px;
  background: var(--el-bg-color);
}

.panel:hover {
  border-color: var(--el-color-primary);
}`,
  html: `<section class="panel" data-id="42">
  <h2 class="panel__title">订单详情</h2>
  <p class="panel__desc">下单后 24 小时内发货</p>
</section>`,
  sql: `SELECT id, name, created_at
FROM users
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 20;`,
  bash: `pnpm install
pnpm build --filter=docs
git commit -m "feat: 新增代码高亮示例"`,
  text: `[2026-10-24 11:40:02] build started
[2026-10-24 11:40:18] build finished in 16.2s
[2026-10-24 11:40:18] 0 errors, 0 warnings`,
};
</script>

<style scoped>
.lang-demo {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}
</style>
