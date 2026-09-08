<template>
  <co-row :gutter="16" class="gap-y-4">
    <co-col v-for="(column, i) in columns" :key="i" :sm="{ span: 12 }" :lg="{ span: 6 }">
      <el-card shadow="never">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="label text-sm font-bold text-(--el-text-color-secondary)">
              {{ t(column.label) }}
            </div>
            <div class="text-2xl font-bold">
              <el-skeleton animated :loading="isFetching" :throttle="{ trailing: 500 }">
                <template #template>
                  <el-skeleton-item variant="text" style="width: 80%" />
                </template>
                <co-number-format
                  :value="data?.[column.prop]"
                  :type="column.type"
                  :precision="column.precision"
                  animate
                />
              </el-skeleton>
            </div>
          </div>
          <div
            class="flex h-12 w-12 items-center justify-center rounded-md bg-(--el-color-primary) text-xl text-white"
          >
            <co-icon :name="column.icon" />
          </div>
        </div>
      </el-card>
    </co-col>
  </co-row>
</template>

<script lang="ts" setup>
import statisticsApi from '@/api/statistics';
import { useFetch } from 'cosey/hooks';
import { type NumberFormatProps } from 'cosey/components';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const { getStatOverview } = statisticsApi;

const columns = ref<
  {
    label: string;
    prop: string;
    icon: string;
    type?: NumberFormatProps['type'];
    precision?: number;
  }[]
>([
  {
    label: 'analysis.totalRechargeCNY',
    prop: 'total_money',
    icon: 'bi bi-cash-coin',
    type: 'currency',
    precision: 2,
  },
  {
    label: 'analysis.totalUsers',
    prop: 'total_user',
    icon: 'bi bi-people',
  },
  {
    label: 'analysis.verifiedUsers',
    prop: 'total_verified_user',
    icon: 'bi bi-person-vcard',
  },
  {
    label: 'analysis.registeredDevices',
    prop: 'total_device',
    icon: 'bi bi-display',
  },
]);

const { isFetching, data } = useFetch<Record<string, any>>(() => getStatOverview());
</script>
