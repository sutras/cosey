<template>
  <co-context-menu @command="onCommand">
    <template #reference>
      <el-button>右键打开（含多级子菜单）</el-button>
    </template>

    <co-context-menu-item icon="bi bi-clipboard" title="复制" command="copy" />
    <co-context-menu-item icon="bi bi-scissors" title="剪切" command="cut" />

    <co-context-sub-menu divided icon="bi bi-share" title="分享到">
      <co-context-menu-item title="微信" command="ShareAppMessage" />
      <co-context-menu-item title="朋友圈" command="ShareTimeline" />
      <co-context-sub-menu title="更多方式">
        <co-context-menu-item title="复制链接" command="copyLink" />
        <co-context-menu-item title="生成图片" command="generateImage" />
        <co-context-sub-menu divided title="导出为">
          <co-context-menu-item title="PNG 图片" command="exportPng" />
          <co-context-menu-item title="PDF 文档" command="exportPdf" />
        </co-context-sub-menu>
      </co-context-sub-menu>
    </co-context-sub-menu>

    <co-context-sub-menu divided icon="bi bi-sort-down" title="排序" disabled>
      <co-context-menu-item title="按名称" command="sortByName" />
      <co-context-menu-item title="按时间" command="sortByTime" />
    </co-context-sub-menu>
  </co-context-menu>
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus';

const onCommand = (command: string) => {
  ElMessage.success(`执行：${command}`);
};
</script>
