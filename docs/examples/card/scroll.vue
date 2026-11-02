<template>
  <div class="stack">
    <co-card title="系统通知" style="max-height: 232px">
      <template #extra>共 {{ notices.length }} 条</template>

      <div v-for="notice in notices" :key="notice.title" class="notice">
        <div class="notice-title">{{ notice.title }}</div>
        <div class="notice-time">{{ notice.time }}</div>
      </div>
    </co-card>

    <!-- 侧栏这种高度由布局决定的容器，卡片自己不用给高度 -->
    <div class="panel">
      <co-card title="部门成员">
        <div v-for="member in members" :key="member.name" class="member">
          <span>{{ member.name }}</span>
          <span class="role">{{ member.role }}</span>
        </div>
      </co-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
const notices = [
  { title: '订单 A20241102001 已完成签收', time: '11-03 09:12' },
  { title: '采购单 PO-20241102-06 等待你审批', time: '11-03 08:40' },
  { title: '接口调用额度已使用 96%', time: '11-02 22:05' },
  { title: '运营部新增成员 1 人', time: '11-02 17:31' },
  { title: '11 月对账单已生成', time: '11-02 09:00' },
  { title: '系统将于 11-05 02:00 维护', time: '11-01 20:18' },
  { title: '退款单 R20241101008 已处理', time: '11-01 15:02' },
];

const members = [
  { name: '张明', role: '产品经理' },
  { name: '李婷', role: '采购' },
  { name: '王建国', role: '前端' },
  { name: '陈雨', role: '设计' },
  { name: '赵伟', role: '后端' },
  { name: '孙倩', role: '测试' },
  { name: '周琦', role: '运维' },
];
</script>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notice {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding-block: 6px;
  font-size: 13px;
}

.notice-title {
  flex: 1;
  min-width: 0;
  color: var(--el-text-color-primary);
}

.notice-time {
  flex: none;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-variant-numeric: tabular-nums;
}

.panel {
  display: flex;
  flex-direction: column;
  height: 200px;
  padding: 8px;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
}

.panel .co-card {
  flex: 1;
}

.member {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-block: 5px;
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.role {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
