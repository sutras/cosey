<template>
  <co-descriptions title="用户信息" tooltip="数据每小时同步一次" :column="2">
    <template #extra>
      <el-button link type="primary">编辑</el-button>
    </template>

    <co-descriptions-item label="用户 ID">1000</co-descriptions-item>
    <co-descriptions-item label="昵称">张三</co-descriptions-item>
    <co-descriptions-item label="注册时间" tooltip="以服务器时间为准">
      2025-10-20
    </co-descriptions-item>
    <co-descriptions-item label="星座">水瓶座</co-descriptions-item>
    <co-descriptions-item label="简介">
      普通用户，最近 30 天登录 18 次，暂无异常操作记录。
    </co-descriptions-item>
  </co-descriptions>
</template>
