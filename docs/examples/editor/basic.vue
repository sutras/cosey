<template>
  <co-editor v-model="value" placeholder="请输入" />
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const value = ref(
  `<p style="">这个问题其实有个隐含的前提需要先澄清：<strong>不是富文本编辑器不支持缩进，而是很多编辑器不支持「用 Tab 键做多级缩进」这种特定交互</strong>。真正的情况更微妙，原因可以分成几层来看。</p><h2 style="">1. Tab 键在浏览器里天生有「第二职业」</h2><p style="">在桌面文字处理软件（Word、Pages）里，Tab 键几乎只有一个含义：缩进。但在网页环境里，Tab 的默认行为是<strong>切换焦点</strong>——这是无障碍访问（键盘导航）的硬性要求。</p><p style="">如果编辑器随意拦截 Tab，用户就没法用键盘跳出编辑区，这对视障用户和纯键盘操作者是灾难。所以很多编辑器选择<strong>不碰 Tab</strong>，或者只在特定条件下拦截（比如列表内、选中多行时）。这直接导致「按 Tab 没反应」的观感。</p><h2 style="">2. HTML/CSS 本身没有「段落缩进」这个语义</h2><p style="">Word 的缩进是文档模型里的一等公民，段落有 <code>indent</code> 属性。而 HTML 里：</p><ul><li><p style="">没有原生的「段落缩进级别」概念</p></li><li><p style="">视觉缩进通常靠 <code>margin-left</code> / <code>padding-left</code> / <code>text-indent</code> 拼出来</p></li><li><p style="">这些是<strong>样式</strong>，不是<strong>结构</strong></p></li></ul><p style="">于是编辑器面临一个建模难题：缩进到底存成什么？</p><ul><li><p style="">存成 CSS 样式？那复制粘贴到别处就丢了，语义也混乱</p></li><li><p style="">存成嵌套的 <code>&lt;div&gt;</code>？结构会越来越深，编辑和序列化都麻烦</p></li><li><p style="">存成 <code>blockquote</code> 或列表嵌套？那是借用别的语义，不纯粹</p></li></ul><p style="">很多编辑器团队评估后觉得「投入产出比不高」，干脆不做，或者只做最浅的一层。</p>`,
);
</script>
