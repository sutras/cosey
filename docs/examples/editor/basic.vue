<template>
  <co-editor v-model="value" placeholder="请输入" />
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const value = ref(
  `<p>在计算领域，<strong>WYSIWYG</strong>（<a href="https://zh.wikipedia.org/wiki/Help:%E8%8B%B1%E8%AA%9E%E5%9C%8B%E9%9A%9B%E9%9F%B3%E6%A8%99" target="_blank"><span style="font-family: Charis, &quot;Charis SIL&quot;, &quot;Doulos SIL&quot;, Gentium, &quot;Gentium Alternative&quot;, GentiumAlt, Code2000, &quot;Segoe UI&quot;, system-ui, sans-serif;">/ˈwɪziwɪɡ/</span></a> <em><span style="font-size: 14.4px;">WIZ</span>-ee-wig</em>；<strong>所见即所得</strong>，<strong>what you see is what you get</strong>）<sup>[1]</sup>是一种软件功能，可使内容在编辑界面中的显示效果，与最终打印或输出成品（如网页、幻灯片等）的外观极为相似。<sup>[2]</sup>换言之，“所见即所得”代表了一种用户界面设计理念：用户在创作文档时，屏幕上看到的画面就是最终生成的结果。<sup>[3]</sup>因此，用户通常可以直观地调整文档的排版，而无需手动输入或记忆复杂的布局命令。<sup>[4]</sup></p><h2>历史</h2><p>在“所见即所得”技术普及前，编辑器通常只能以系统默认的字体和样式显示文本，几乎无法提供页边距、行距等布局预览。用户必须输入特殊的非打印“控制代码”（现称为标记标签），才能使特定文本在最终输出时呈现为粗体、斜体，或改变其字体与大小。在这种纯文本环境下，早期的文本编辑器和文字处理器之间几乎没有明显的界限。<sup>[5]</sup></p><p>早期的文字处理应用通常各自使用一套独特的标记语言来定义格式标签。由于各软件的格式标准互不兼容，用户在不同的文字处理器之间迁移文档是一件极其困难且耗时的工作。因其能精确控制复杂的排版信息，标记标签和代码时至今日在某些专业应用中依然盛行。然而，如果在编辑器中直接显示这些标签，它们会占据原本属于纯文本的视觉空间，从而破坏版面的整洁度与阅读的流畅感。</p>`,
);
</script>
