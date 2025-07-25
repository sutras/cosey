<template>
  <el-dialog
    v-model="visible"
    :title="t('config.configGroup')"
    :style="{ maxWidth: 'calc(100vw - 32px)' }"
    :width="1200"
  >
    <co-table v-bind="tableProps">
      <template #toolbar-left>
        <el-button v-if="can('create', 'system_config_group')" type="primary" @click="upsert.add()">
          {{ t('common.add') }}
        </el-button>
      </template>
      <template #action="{ row }">
        <co-table-action
          :actions="[
            {
              hidden: cannot('update', 'system_config_group'),
              label: t('common.edit'),
              icon: 'carbon:edit',
              onClick: () => {
                upsert.edit(row);
              },
            },
            {
              hidden: cannot('delete', 'system_config_group'),
              label: t('common.delete'),
              icon: 'carbon:trash-can',
              type: 'danger',
              popconfirm: {
                title: t('common.confirmDelete'),
                confirm: () => onDelete(row.id),
              },
            },
          ]"
        />
      </template>
    </co-table>
  </el-dialog>

  <ConfigGroupUpsert :ref="upsert.ref" />
</template>

<script lang="tsx" setup>
import { ElMessage } from 'element-plus';
import { useConfigGroupsApi } from '@/api/system/configs';
import ConfigGroupUpsert from './config-group-upsert.vue';
import { useOuterUpsert } from 'cosey/hooks';
import { useTable } from 'cosey/components';
import { computed, nextTick, ref } from 'vue';
import { useAbility } from '@casl/vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineOptions({
  name: 'SystemConfigGroups',
});

const { can, cannot } = useAbility();

const { getConfigGroups, deleteConfigGroup } = useConfigGroupsApi();

const [tableProps, { reload }] = useTable(
  computed(() => ({
    api: getConfigGroups,
    columns: [
      { prop: 'id', label: 'ID' },
      { prop: 'name', label: t('config.name') },
      { prop: 'createdAt', label: t('common.creationTime'), renderer: 'datetime' },
      { prop: 'updatedAt', label: t('common.updateTime'), renderer: 'datetime' },
    ],
    actionColumn: {
      label: t('common.actions'),
      slots: 'action',
      fixed: 'right',
      minWidth: 220,
    },
    height: '100%',
    formProps: {
      schemes: [{ prop: 'name', label: t('config.name') }],
    },

    immediate: false,
  })),
);

const upsert = useOuterUpsert({
  success() {
    reload();
  },
});

const onDelete = async (id: number) => {
  return deleteConfigGroup(id).then(() => {
    ElMessage.success(t('common.deleteSuccess'));
    reload();
  });
};

const visible = ref(false);

defineExpose({
  open() {
    visible.value = true;
    nextTick(() => {
      reload();
    });
  },
});
</script>
