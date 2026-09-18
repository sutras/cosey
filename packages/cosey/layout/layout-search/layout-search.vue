<template>
  <div>
    <el-button link :class="[bem.e('button')]" @click="open = !open">
      <Icon v-if="layoutStore.isMobile" size="xl"><RtiSearch /></Icon>
      <div v-else :class="bem.e('button-wrapper')">
        <Icon size="lg"><RtiSearch /></Icon>
        <span :class="bem.e('button-text')">{{ t('co.form.search') }}</span>
        <span :class="bem.e('button-kbd')">
          {{ controlKey }}
          <kbd>K</kbd>
        </span>
      </div>
    </el-button>

    <el-dialog v-model="open" :show-close="false" append-to-body width="560px" :class="bem.b()">
      <template #header>
        <el-input
          ref="input"
          v-model="searchValue"
          :placeholder="t('co.search.searchPage')"
          size="large"
          :class="bem.e('input')"
          clearable
          @keydown="onKeydown"
        >
          <template #prefix>
            <Icon size="xl" :class="bem.e('input-icon')"><RtiSearch /></Icon>
          </template>
        </el-input>
      </template>
      <el-scrollbar :class="bem.e('content')" max-height="calc(100vh - 15vh - 50px - 150px)">
        <div v-if="searchResult.length === 0" :class="bem.e('empty')">
          {{ t('co.search.noResults') }}
        </div>
        <template v-else>
          <div
            v-for="(item, index) in searchResult"
            ref="item"
            :key="item.name"
            :class="[bem.e('item'), bem.is('active', activeIndex === index)]"
            @mouseenter="onMouseEnter(index)"
            @click="onSelect(item)"
          >
            <div :class="bem.e('item-title')">{{ item.title }}</div>
            <div :class="bem.e('item-path')">{{ item.path }}</div>
          </div>
        </template>
      </el-scrollbar>
      <template #footer>
        <div :class="bem.e('footer')">
          <div>
            <Icon><RtiReturn /></Icon>
            <span :class="bem.e('footer-text')">{{ t('co.search.select') }}</span>
          </div>
          <div>
            <Icon><RtiArrowUp /></Icon>
            <Icon><RtiArrowDown /></Icon>
            <span :class="bem.e('footer-text')">{{ t('co.search.switch') }}</span>
          </div>
          <div>
            <small>Esc</small>
            <span :class="bem.e('footer-text')">{{ t('co.common.close') }}</span>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue';
import { useRouter } from 'vue-router';
import { throttle } from 'lodash-es';
import { type MenuItem } from '../../router';
import { useLayoutStore } from '../../store';
import { useDocumentEvent } from '../../hooks';
import { getControlKey } from '../../utils';
import { Icon } from '../../components';

import { type InputInstance, ElButton } from 'element-plus';
import { useTimeoutFn } from '@vueuse/core';
import { useLocale } from '../../hooks';
import { useI18n } from 'vue-i18n';
import { createBem } from '../../utils';
import { RtiArrowDown, RtiArrowUp, RtiReturn, RtiSearch } from 'richtext-icons';

defineOptions({
  name: 'CoLayoutSearch',
});

const { t } = useLocale();

const { t: _t, te } = useI18n();

const bem = createBem('layout-search');

const controlKey = getControlKey();

const router = useRouter();

const layoutStore = useLayoutStore();

interface Option {
  title: string;
  path: string;
  name: string;
}

const menuOptions = computed(() => {
  const result: Option[] = [];

  function recur(items: MenuItem[], parentTitle?: string, parentPath?: string) {
    items.forEach((item) => {
      let title = item.title || '';
      title = te(title) ? _t(title) : title;
      const mergedTitle = parentTitle ? parentTitle + ' > ' + title : title;

      let path = item.path || '';
      const mergedPath =
        path.startsWith('/') || !parentPath || /^https?:\/\//.test(path)
          ? path
          : parentPath + '/' + path;

      if (!item.children || item.children.length === 0) {
        result.push({
          title: mergedTitle,
          path: mergedPath,
          name: item.route.name as string,
        });
      } else {
        recur(item.children, mergedTitle, mergedPath);
      }
    });
  }
  recur(layoutStore.menus);
  return result;
});

const open = ref(false);
const inputRef = useTemplateRef<InputInstance>('input');
const searchValue = ref('');
const searchResult = ref<Option[]>([]);

useDocumentEvent('keydown', (event) => {
  if (event.metaKey && event.code === 'KeyK') {
    event.preventDefault();
    open.value = true;
  }
});

watch(
  open,
  () => {
    if (open.value) {
      searchValue.value = '';
      setTimeout(() => {
        inputRef.value?.focus();
      }, 100);
    }
  },
  {
    immediate: true,
  },
);

const search = throttle(() => {
  const lowerValue = searchValue.value.trim().toLowerCase();
  searchResult.value = lowerValue
    ? menuOptions.value.filter(({ title, name, path }) => {
        return (
          title.toLowerCase().includes(lowerValue) ||
          path.toLowerCase().includes(lowerValue) ||
          name.toLowerCase().includes(lowerValue)
        );
      })
    : [];

  activeIndex.value = 0;
}, 350);

watch(searchValue, () => {
  search();
});

const activeIndex = ref(0);

const itemRef = useTemplateRef('item');

watch(activeIndex, () => {
  const el = itemRef.value![activeIndex.value];
  if (el) {
    el.scrollIntoView({ block: 'nearest' });
  }
});

const timeout = useTimeoutFn(() => {}, 500);

const onKeydown = (event: Event | KeyboardEvent) => {
  if (!(event instanceof KeyboardEvent)) {
    return;
  }
  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowUp': {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      let index = activeIndex.value + delta;
      const length = searchResult.value.length;

      if (index < 0) {
        index = length - 1;
      } else if (index >= length) {
        index = 0;
      }
      activeIndex.value = index;
      const el = itemRef.value![index];
      if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'nearest' });
        timeout.start();
      }
      return;
    }

    case 'Enter': {
      event.preventDefault();
      const item = searchResult.value[activeIndex.value];
      if (item) {
        onSelect(item);
      }
      return;
    }
  }
};

const onMouseEnter = (index: number) => {
  if (!timeout.isPending.value) {
    activeIndex.value = index;
  }
};

const onSelect = (item: Option) => {
  router.push({ name: item.name });
  open.value = false;
};
</script>
