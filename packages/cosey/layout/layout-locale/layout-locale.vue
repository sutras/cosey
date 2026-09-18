<template>
  <el-dropdown v-if="messages.length > 1" placement="bottom" trigger="click" @command="onCommand">
    <el-button link size="large">
      <Icon size="lg"><RtiTranslate /></Icon>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-for="option in messages" :key="option.value" :command="option.value">
          <div style="width: 24px">
            <Icon v-if="option.value === locale" size="lg"><RtiCheck /></Icon>
          </div>
          {{ option.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { Icon } from '../../components';
import { useLocaleMessages } from '../../locale';
import { useI18n } from 'vue-i18n';
import { RtiCheck, RtiTranslate } from 'richtext-icons';

defineOptions({
  name: 'CoLayoutLocale',
});

const messages = useLocaleMessages();

const { locale } = useI18n();

const onCommand = (lang: string) => {
  locale.value = lang;
};
</script>
