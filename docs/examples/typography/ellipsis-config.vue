<template>
  <div class="stack">
    <div class="block">
      <p class="label">
        单行省略（
        <code>ellipsis</code>
        为 true）
      </p>
      <co-typography-text :text="text" ellipsis />
    </div>

    <div class="block">
      <p class="label">
        自定义省略号（
        <code>symbol</code>
        ）
      </p>
      <co-typography-paragraph :text="text" :ellipsis="{ rows: 2, symbol: '……' }" />
    </div>

    <div class="block">
      <p class="label">
        自定义按钮文案（
        <code>expand-text</code>
        /
        <code>collapse-text</code>
        ）
      </p>
      <co-typography-paragraph
        :text="text"
        :ellipsis="{ rows: 2, expandable: true, expandText: '展开全文', collapseText: '收起来' }"
      />
    </div>

    <div class="block">
      <p class="label">
        挂到标题上（
        <code>level</code>
        仍生效）
      </p>
      <co-typography-title :level="5" :text="text" :ellipsis="{ rows: 2, expandable: true }" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const text = ref(
  '大江东去，浪淘尽，千古风流人物。故垒西边，人道是：三国周郎赤壁。乱石穿空，惊涛拍岸，卷起千堆雪。江山如画，一时多少豪杰。遥想公瑾当年，小乔初嫁了，雄姿英发。',
);
</script>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.block {
  max-width: 320px;
}

.label {
  margin: 0 0 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
