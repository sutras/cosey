<template>
  <div class="stack">
    <co-typography-paragraph>
      普通正文，用
      <co-typography-text strong>加粗</co-typography-text>
      或
      <co-typography-text type="secondary">次要信息</co-typography-text>
      这类行内样式。
    </co-typography-paragraph>

    <co-typography-paragraph type="secondary">次要文本（type="secondary"）</co-typography-paragraph>
    <co-typography-paragraph type="success">成功文本（type="success"）</co-typography-paragraph>
    <co-typography-paragraph type="warning">警告文本（type="warning"）</co-typography-paragraph>
    <co-typography-paragraph type="danger">错误文本（type="danger"）</co-typography-paragraph>
    <co-typography-paragraph disabled>禁用文本（disabled）</co-typography-paragraph>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>
