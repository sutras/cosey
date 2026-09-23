<template>
  <div class="editor-features">
    <co-editor
      v-model="value"
      :features="features"
      :mode="mode"
      placeholder="切换下面的功能开关，工具栏与块级菜单会跟着变化"
    />

    <div class="editor-features__bar">
      <el-radio-group v-model="mode">
        <el-radio-button value="static">固定工具栏</el-radio-button>
        <el-radio-button value="float">浮动工具栏</el-radio-button>
      </el-radio-group>

      <el-checkbox-group v-model="selected">
        <el-checkbox v-for="item in options" :key="item.value" :value="item.value">
          {{ item.label }}
        </el-checkbox>
      </el-checkbox-group>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';

const options = [
  { label: '加粗', value: 'bold' },
  { label: '斜体', value: 'italic' },
  { label: '文字颜色', value: 'color' },
  { label: '标题', value: 'heading' },
  { label: '无序列表', value: 'bulleted-list' },
  { label: '左对齐', value: 'align-left' },
  { label: '链接', value: 'link' },
  { label: '图片', value: 'image' },
  { label: '表格', value: 'table' },
  { label: '源码', value: 'source' },
];

const selected = ref(options.map((item) => item.value));

const features = computed(() => selected.value.join(','));

const mode = ref<'static' | 'float'>('static');

const value = ref(
  '<p>只有被勾选的功能才会出现在工具栏里，浮动工具栏与块级菜单同样受 <strong>features</strong> 约束。</p>',
);
</script>

<style lang="scss" scoped>
.editor-features {
  &__bar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 24px;
    align-items: center;
    margin-top: 12px;
  }
}
</style>
