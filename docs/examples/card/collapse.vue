<template>
  <co-card v-model:collapsed="collapsed" title="筛选条件" collapsible="header">
    <template #extra>{{ collapsed ? '已收起' : '点击标题区收起' }}</template>

    <div class="fields">
      <el-input v-model="query.keyword" class="field" placeholder="订单号 / 客户名称" clearable />

      <el-select v-model="query.status" class="field" placeholder="订单状态" clearable>
        <el-option label="待付款" value="pending" />
        <el-option label="待发货" value="paid" />
        <el-option label="已完成" value="done" />
      </el-select>

      <el-date-picker
        v-model="query.date"
        class="field"
        type="date"
        placeholder="下单日期"
        value-format="YYYY-MM-DD"
      />

      <div class="actions">
        <el-button type="primary" @click="onSearch">查询</el-button>
        <el-button @click="onReset">重置</el-button>
      </div>
    </div>
  </co-card>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';

const collapsed = ref(false);

const query = reactive<{ keyword: string; status: string; date: string }>({
  keyword: '',
  status: '',
  date: '',
});

const onSearch = () => {
  ElMessage.success(`已查询：${query.keyword || '全部订单'}`);
};

const onReset = () => {
  query.keyword = '';
  query.status = '';
  query.date = '';
};
</script>

<style scoped>
.fields {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.field {
  width: 200px;
}

.actions {
  display: flex;
  gap: 8px;
  margin-inline-start: auto;
}
</style>
