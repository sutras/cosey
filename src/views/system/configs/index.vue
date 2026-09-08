<template>
  <co-container full-page>
    <co-table v-bind="tableProps">
      <template #toolbar-left>
        <el-button v-if="can('create', 'system_config')" type="primary" @click="upsert.add()">
          {{ t('common.add') }}
        </el-button>
        <el-button
          v-if="can('read', 'system_config_group')"
          type="primary"
          @click="configGroupsRef?.open()"
        >
          {{ t('config.configGroup') }}
        </el-button>
      </template>
      <template #action="{ row }">
        <co-table-action
          :actions="[
            {
              hidden: cannot('update', 'system_config'),
              label: t('common.edit'),
              icon: 'bi bi-pencil-square',
              onClick: () => {
                upsert.edit(row);
              },
            },
            {
              hidden: cannot('delete', 'system_config'),
              label: t('common.delete'),
              icon: 'bi bi-trash3',
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

    <ConfigUpsert :ref="upsert.ref" />

    <ConfigGroups ref="configGroups" />
  </co-container>
</template>

<script lang="tsx" setup>
import { ElMessage } from 'element-plus';
import configsApi from '@/api/system/configs';
import ConfigUpsert from './configs-upsert.vue';
import { useFetch, useOuterUpsert } from 'cosey/hooks';
import { LongText, MediaCard, MediaCardGroup, useTable } from 'cosey/components';
import { computed, ref, useTemplateRef } from 'vue';
import ConfigGroups from '../config-groups/index.vue';
import { useAbility } from '@casl/vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineOptions({
  name: 'SystemConfigs',
});

const { can, cannot } = useAbility();

const { getConfigs, deleteConfig, getConfigGroups } = configsApi;

const configGroupOptions = ref<any[]>([]);

const [tableProps, { reload }] = useTable(
  computed(() => ({
    api: getConfigs,
    columns: [
      { prop: 'id', label: 'ID' },
      { prop: 'group.name', label: t('config.belongGroup') },
      { prop: 'name', label: t('config.name'), minWidth: 200 },
      {
        prop: 'value',
        label: t('config.value'),
        minWidth: 300,
        format(cellValue, row) {
          switch (row.type) {
            case 'textarea':
              return <LongText text={cellValue} />;
            case 'image':
              return <MediaCard src={cellValue} />;
            case 'album':
              return <MediaCardGroup srcset={cellValue} size="small" />;
            case 'bool':
              return cellValue ? t('common.yes') : t('common.no');
            case 'text':
            case 'number':
              return cellValue;
          }
        },
      },
      { prop: 'key', label: 'Key' },
      { prop: 'createdAt', label: t('common.creationTime'), renderer: 'datetime' },
      { prop: 'updatedAt', label: t('common.updateTime'), renderer: 'datetime' },
    ],
    actionColumn: {
      label: t('common.actions'),
      slots: 'action',
      fixed: 'right',
      minWidth: 140,
    },
    height: '100%',
    formProps: {
      schemes: [
        {
          prop: 'groupId',
          label: t('config.belongGroup'),
          fieldType: 'select',
          fieldProps: {
            options: configGroupOptions,
            props: {
              label: 'name',
              value: 'id',
            },
          },
        },
        { prop: 'name', label: t('config.name') },
        { prop: 'key', label: 'Key' },
      ],
    },
  })),
);

const upsert = useOuterUpsert({
  success() {
    reload();
  },
});

const onDelete = async (id: number) => {
  return deleteConfig(id).then(() => {
    ElMessage.success(t('common.deleteSuccess'));
    reload();
  });
};

useFetch<{ list: any[] }>(() => getConfigGroups(), {
  onSuccess(data) {
    configGroupOptions.value = data.list;
  },
});

const configGroupsRef = useTemplateRef('configGroups');
</script>
