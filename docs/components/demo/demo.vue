<template>
  <div class="demo">
    <div class="demo-display">
      <slot name="display"></slot>
    </div>

    <div class="demo-toolbar">
      <co-copy :text="decodedSource" />

      <el-button link @click="onToggle">
        <co-icon name="bi bi-code" />
      </el-button>
    </div>

    <el-collapse-transition>
      <div v-show="show" v-html="decodedCode" class="demo-code"></div>
    </el-collapse-transition>

    <el-collapse-transition>
      <div v-show="show" class="demo-fold">
        <el-button link class="demo-fold-button" @click="onHide">
          <co-icon name="bi bi-code-slash" size="lg" />
          <span class="demo-fold-text">隐藏源代码</span>
        </el-button>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script lang="ts" setup>
import { Icon as CoIcon, Copy as CoCopy } from 'cosey/components';
import { ElCollapseTransition, ElButton } from 'element-plus';
import { computed, ref } from 'vue';

const props = defineProps<{
  code?: string;
  source?: string;
}>();

const decodedSource = computed(() => decodeURIComponent(props.source!));
const decodedCode = computed(() => decodeURIComponent(props.code!));

const show = ref(false);

const onToggle = () => {
  show.value = !show.value;
};

const onHide = () => {
  show.value = false;
};
</script>

<style lang="scss" scoped>
.demo {
  margin-block: var(--el-margin);
  border-radius: var(--el-border-radius-base);
  border: var(--el-border-width) var(--el-border-style) var(--el-border-color);
  background-color: var(--el-bg-color);

  &-display {
    overflow: auto;
    padding: var(--el-padding);
  }

  &-toolbar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: var(--el-size-xxl);
    padding-inline: var(--el-padding);
    padding-block: var(--el-padding-xs);
    border-block-start: var(--el-border-width) var(--el-border-style) var(--el-border-color);
  }

  &-code {
    :deep(div[class*='language-']) {
      border-radius: 0;
      position: relative;
      margin: 0;
      background-color: var(--vp-code-block-bg);
      overflow-x: auto;
      transition: background-color 0.5s;

      pre {
        position: relative;
        z-index: 1;
        margin: 0;
        padding: 20px 0;
        background: transparent;
        overflow-x: auto;
      }

      code {
        display: block;
        padding: 0 24px;
        width: fit-content;
        min-width: 100%;
        line-height: var(--vp-code-line-height);
        font-size: var(--vp-code-font-size);
        color: var(--vp-code-block-color);
        transition: color 0.5s;
      }
    }
  }

  &-fold {
    position: sticky;
    inset-inline: 0;
    inset-block-end: 0;
    z-index: 10;
    overflow: hidden;
    border-bottom-left-radius: inherit;
    border-bottom-right-radius: inherit;
    border-block-start: var(--el-border-width) var(--el-border-style) var(--el-bg-color);
    background-color: var(--el-bg-color);
    margin-inline-start: 1px;

    &-button {
      width: 100%;
      padding-block: var(--el-padding-sm);
    }

    &-text {
      margin-inline-start: var(--el-margin-xxs);
    }
  }
}
</style>
