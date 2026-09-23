<template>
  <div class="editor-expose">
    <div class="editor-expose__bar">
      <el-button @click="onInsert">插入文本</el-button>
      <el-button @click="onInsertBold">插入加粗文本</el-button>
      <el-button @click="onToggleMark">切换斜体</el-button>
      <el-button @click="onInsertTable">插入表格</el-button>
      <el-button @click="onRead">读取内容</el-button>
    </div>

    <co-editor ref="editorRef" v-model="value" placeholder="先把光标放进编辑区，再点上面的按钮" />

    <p v-if="content" class="editor-expose__content">当前内容：{{ content }}</p>
  </div>
</template>

<script lang="ts" setup>
import { ref, useTemplateRef } from 'vue';
import type { EditorExpose } from 'cosey/components';

const editorRef = useTemplateRef<EditorExpose>('editorRef');

const value = ref('<p>点上面的按钮，往光标处插入内容。</p>');
const content = ref('');

const onInsert = () => {
  editorRef.value?.insertText('一段插入的文本');
};

const onInsertBold = () => {
  // 先打开加粗，插入的文字会继承插入点的行内样式
  editorRef.value?.toggleMark('bold');
  editorRef.value?.insertText('加粗文本');
  editorRef.value?.toggleMark('bold');
};

const onToggleMark = () => {
  editorRef.value?.toggleMark('italic');
};

const onInsertTable = () => {
  editorRef.value?.insertTable(3, 3);
};

const onRead = () => {
  content.value = editorRef.value?.getContent() ?? '';
};
</script>

<style lang="scss" scoped>
.editor-expose {
  &__bar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }

  &__content {
    margin: 12px 0 0;
    font-size: 12px;
    color: var(--co-text-color-secondary, #909399);
    word-break: break-all;
  }
}
</style>
