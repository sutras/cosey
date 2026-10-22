<template>
  <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center">
    <co-dict-tag dict="user_status" :value="1" />
    <co-dict-tag dict="user_status" :value="0" />
    <co-dict-tag dict="user_status" :value="2" />
    <co-dict-tag dict="user_status" :value="9" />
    <co-dict-tag dict="user_status" :value="9" fallback="未知状态" type="danger" effect="plain" />

    <co-dict-tag
      :options="[
        { value: 'draft', label: '草稿', color: 'info' },
        { value: 'published', label: '已发布', color: 'success' },
      ]"
      value="published"
    />

    <!-- labelKey 走 i18n，切换语言时自动更新 -->
    <co-dict-tag dict="yes_no" :value="1" />
    <co-dict-tag dict="yes_no" :value="0" />

    <!-- labelKey 指向应用自己的词条（i18n.messages[].app） -->
    <co-dict-tag dict="post_status" value="draft" />
    <co-dict-tag dict="post_status" value="published" />

    <el-button size="small" @click="toggleLocale">切换语言</el-button>

    <!-- useDict 与组件走同一套解析规则 -->
    <span class="dict-get-label">useDict：{{ postStatus.getLabel('published') }}</span>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useDict } from 'cosey';

const { locale } = useI18n();

const postStatus = useDict('post_status');

const toggleLocale = () => {
  locale.value = locale.value === 'en' ? 'zh-cn' : 'en';
};
</script>
