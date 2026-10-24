<template>
  <div class="stack">
    <div class="block">
      <p class="label">短文本：没超过行数，不加省略号</p>
      <co-typography-paragraph text="这一行放得下，不会被省略。" :ellipsis="{ rows: 3 }" />
    </div>

    <div class="block">
      <p class="label">长文本：超过 3 行被省略，末尾接「…展开」</p>
      <co-typography-paragraph
        :text="text"
        :ellipsis="{ rows: 3, expandable: true }"
        @expand-change="onExpandChange"
      />
      <p class="state">当前状态：{{ expanded ? '已展开' : '已收起' }}</p>
    </div>

    <div class="block">
      <p class="label">同时开复制：按钮排在展开按钮右边</p>
      <co-typography-paragraph copyable :text="text" :ellipsis="{ rows: 2, expandable: true }" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const text = ref(
  '大江东去，浪淘尽，千古风流人物。故垒西边，人道是：三国周郎赤壁。乱石穿空，惊涛拍岸，卷起千堆雪。江山如画，一时多少豪杰。遥想公瑾当年，小乔初嫁了，雄姿英发。',
);

const expanded = ref(false);

const onExpandChange = (value: boolean) => {
  expanded.value = value;
};
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

.state {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
