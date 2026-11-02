<template>
  <co-card-tabs v-model="active" title="企业版套餐" tab-type="card">
    <template #extra>
      <el-button size="small" type="primary">立即购买</el-button>
    </template>

    <co-card-tab-panel name="feature" label="套餐功能">
      <ul class="list">
        <li>不限成员数，支持多部门与角色权限</li>
        <li>接口调用额度 50 万次 / 月</li>
        <li>审批流、对账单、开放 API</li>
      </ul>
    </co-card-tab-panel>

    <co-card-tab-panel name="price" label="价格">
      <div class="rows">
        <div class="row">
          <span>按月付费</span>
          <span>¥ 1,280 / 月</span>
        </div>
        <div class="row">
          <span>按年付费</span>
          <span>¥ 12,800 / 年（省 2 个月）</span>
        </div>
        <div class="row">
          <span>超出额度</span>
          <span>¥ 0.02 / 次</span>
        </div>
      </div>
    </co-card-tab-panel>

    <co-card-tab-panel name="faq" label="常见问题">
      <div class="rows">
        <div class="row">
          <span>可以中途降级吗？</span>
          <span>可以，按剩余天数折算</span>
        </div>
        <div class="row">
          <span>支持开专票吗？</span>
          <span>支持，提交后 3 个工作日内寄出</span>
        </div>
      </div>
    </co-card-tab-panel>
  </co-card-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const active = ref('feature');
</script>

<style scoped>
.list {
  margin: 0;
  padding-inline-start: 18px;
  font-size: 13px;
  line-height: 2;
  color: var(--el-text-color-regular);
}

.rows {
  display: flex;
  flex-direction: column;
}

.row {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding-block: 6px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.row > span:first-child {
  color: var(--el-text-color-secondary);
}
</style>
