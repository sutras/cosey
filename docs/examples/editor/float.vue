<template>
  <co-editor
    v-model="value"
    placeholder="选中文字试试浮动工具条，鼠标移入试试块级菜单"
    toolbar="float"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const value = ref(
  `<p style="">这个问题其实有个隐含的前提需要先澄清：<strong>不是富文本编辑器不支持缩进，而是很多编辑器不支持「用 Tab 键做多级缩进」这种特定交互</strong>。真正的情况更微妙，原因可以分成几层来看。</p><h2 style="">1. Tab 键在浏览器里天生有「第二职业」</h2><p style="">在桌面文字处理软件（Word、Pages）里，Tab 键几乎只有一个含义：缩进。但在网页环境里，Tab 的默认行为是<strong>切换焦点</strong>——这是无障碍访问（键盘导航）的硬性要求。</p>`,
);
</script>
