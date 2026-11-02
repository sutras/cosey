<template>
  <div class="stack">
    <co-card title="采购单 PO-20241102-06" footer="提交人 李婷 · 金额 ¥ 12,800.00" collapsible>
      <p class="line">办公椅 20 把，补充 3 楼新工位。期望 11 月 15 日前到货。</p>
    </co-card>

    <co-card
      title="接口调用额度即将用尽"
      header-class="tinted"
      body-class="tinted"
      footer-class="tinted"
      :header-style="{ borderBlockEndColor: 'var(--el-color-warning)' }"
    >
      <p class="line">本月已使用 96%（48.2 万 / 50 万次），超出后请求会被限流 1 小时。</p>

      <template #footer>
        <div class="actions">
          <el-button size="small">查看用量明细</el-button>
          <el-button size="small" type="primary">申请扩容</el-button>
        </div>
      </template>
    </co-card>
  </div>
</template>

<script lang="ts" setup></script>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 这三块都在子组件里，类名要穿透 scoped */
:deep(.tinted) {
  background-color: var(--el-fill-color-lighter);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.line {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-regular);
}
</style>
