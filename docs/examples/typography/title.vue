<template>
  <div class="stack">
    <co-typography-title :level="1">一级标题 h1</co-typography-title>
    <co-typography-title :level="2">二级标题 h2</co-typography-title>
    <co-typography-title :level="3">三级标题 h3</co-typography-title>
    <co-typography-title :level="4">四级标题 h4</co-typography-title>
    <co-typography-title :level="5">五级标题 h5</co-typography-title>
    <co-typography-title :level="3" type="secondary">带语义色的标题</co-typography-title>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
