<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <el-radio-group v-model="mode">
      <el-radio value="success">有数据</el-radio>
      <el-radio value="loading">加载中</el-radio>
      <el-radio value="empty">空数据</el-radio>
      <el-radio value="error">错误</el-radio>
    </el-radio-group>

    <co-async
      :loading="mode === 'loading'"
      :empty="mode === 'empty'"
      :error="mode === 'error' ? '接口请求失败' : undefined"
      empty-text="暂无数据"
      @retry="mode = 'success'"
    >
      <!-- 插槽参数：data / loading / error / isEmpty / retry -->
      <template #default="{ loading, error, isEmpty, retry }">
        <co-card>这里是内容区，加载完成后才渲染。</co-card>
        <p class="async-slot-probe">
          loading={{ loading }} isEmpty={{ isEmpty }} error={{ error }} retry={{ typeof retry }}
        </p>
      </template>
    </co-async>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const mode = ref<'success' | 'loading' | 'empty' | 'error'>('success');
</script>
