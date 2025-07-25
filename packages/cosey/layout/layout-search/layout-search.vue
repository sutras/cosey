<template>
  <div>
    <el-button link :class="[hashId, `${prefixCls}-button`]" @click="open = !open">
      <Icon v-if="layoutStore.isMobile" size="xl" name="co:search" />
      <div v-else :class="`${prefixCls}-button-wrapper`">
        <Icon name="co:search" size="lg" />
        <span :class="`${prefixCls}-button-text`">{{ t('co.form.search') }}</span>
        <span :class="`${prefixCls}-button-kbd`">
          {{ controlKey }}
          <kbd>K</kbd>
        </span>
      </div>
    </el-button>

    <el-dialog
      v-model="open"
      :show-close="false"
      append-to-body
      width="560px"
      :class="[hashId, prefixCls]"
    >
      <template #header>
        <el-input
          ref="input"
          v-model="searchValue"
          :placeholder="t('co.search.searchPage')"
          size="large"
          :class="`${prefixCls}-input`"
          clearable
          @keydown="onKeydown"
        >
          <template #prefix>
            <Icon name="co:search" size="xl" :class="`${prefixCls}-input-icon`" />
          </template>
        </el-input>
      </template>
      <el-scrollbar :class="`${prefixCls}-content`" max-height="calc(100vh - 15vh - 50px - 150px)">
        <div v-if="searchResult.length === 0" :class="`${prefixCls}-empty`">
          {{ t('co.search.noResults') }}
        </div>
        <template v-else>
          <div
            v-for="(item, index) in searchResult"
            ref="item"
            :key="item.value"
            :class="[`${prefixCls}-item`, { 'is-active': activeIndex === index }]"
            @mouseenter="onMouseEnter(index)"
            @click="onSelect(item)"
          >
            <div>{{ item.label }}</div>
            <Icon
              v-show="activeIndex === index"
              name="co:return"
              size="xl"
              :class="`${prefixCls}-enter`"
            />
          </div>
        </template>
      </el-scrollbar>
      <template #footer>
        <div :class="`${prefixCls}-footer`">
          <div>
            <Icon name="co:return" />
            <span :class="`${prefixCls}-footer-text`">{{ t('co.search.select') }}</span>
          </div>
          <div>
            <Icon name="co:arrow-up" />
            <Icon name="co:arrow-down" />
            <span :class="`${prefixCls}-footer-text`">{{ t('co.search.switch') }}</span>
          </div>
          <div>
            <small>Esc</small>
            <span :class="`${prefixCls}-footer-text`">{{ t('co.common.close') }}</span>
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
import { Icon, useComponentConfig } from '../../components';

import useStyle from './style';
import { type InputInstance, ElButton } from 'element-plus';
import { useTimeoutFn } from '@vueuse/core';
import { useLocale } from '../../hooks';
import { useI18n } from 'vue-i18n';

defineOptions({
  name: 'LayoutSearch',
});

const { t } = useLocale();

const { t: _t } = useI18n();

const { prefixCls } = useComponentConfig('layout-search');

const { hashId } = useStyle(prefixCls);

const controlKey = getControlKey();

const router = useRouter();

const layoutStore = useLayoutStore();

interface Option {
  value: string;
  label: string;
  menuItem: MenuItem;
}

const menuOptions = computed(() => {
  const result: Option[] = [];

  function recur(items: MenuItem[], parent?: string) {
    items.forEach((item) => {
      const label = parent ? parent + ' > ' + _t(item.title as string) : _t(item.title as string);

      if (!item.children || item.children.length === 0) {
        result.push({
          label,
          value: item.route.name as string,
          menuItem: item,
        });
      } else {
        recur(item.children, label);
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
    ? menuOptions.value.filter(({ menuItem, label, value }) => {
        return (
          label.toLowerCase().includes(lowerValue) ||
          menuItem.route.path.toLowerCase().includes(lowerValue) ||
          value.toLowerCase().includes(lowerValue)
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
  router.push({ name: item.value });
  open.value = false;
};
</script>
