<template>
  <co-stack-dialog v-model="visible" :title="t('enum.enumItem')" :key="enumId">
    <co-table v-bind="tableProps">
      <template #toolbar-left>
        <el-button v-if="can('create', 'system_enum_item')" type="primary" @click="upsert.add()">
          {{ t('common.add') }}
        </el-button>
      </template>
      <template #action="{ row }">
        <co-table-action
          :actions="[
            {
              hidden: cannot('update', 'system_enum_item'),
              label: t('common.edit'),
              icon: 'bi bi-pencil-square',
              onClick: () => {
                upsert.edit(row);
              },
            },
            {
              hidden: cannot('delete', 'system_enum_item'),
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
  </co-stack-dialog>

  <Upsert :ref="upsert.ref" />
</template>

<script lang="tsx" setup>
import { ElMessage } from 'element-plus';
import enumsApi from '@/api/system/enums';
import Upsert from './enum-item-upsert.vue';
import { useOuterUpsert } from 'cosey/hooks';
import { useTable } from 'cosey/components';
import { useRoute } from 'vue-router';
import { computed, nextTick, ref } from 'vue';
import { useAbility } from '@casl/vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineOptions({
  name: 'SystemEnumItems',
});

const { can, cannot } = useAbility();

const enumId = ref<number>();

const route = useRoute();

const { getEnumItems, deleteEnumItem } = enumsApi;

const [tableProps, { reload }] = useTable(
  computed(() => ({
    api: (params) => getEnumItems(enumId.value!, params),
    columns: [
      { prop: 'id', label: 'ID' },
      { prop: 'name', label: t('enum.name') },
      { prop: 'value', label: t('enum.name') },
      { prop: 'createdAt', label: t('common.creationTime'), renderer: 'datetime' },
      { prop: 'updatedAt', label: t('common.updateTime'), renderer: 'datetime' },
    ],
    actionColumn: {
      label: t('common.actions'),
      slots: 'action',
      fixed: 'right',
      minWidth: 280,
    },
    height: '100%',
    formProps: {
      schemes: [
        { prop: 'name', label: t('enum.name') },
        { prop: 'value', label: t('enum.name') },
      ],
    },

    immediate: false,
  })),
);

const upsert = useOuterUpsert<object, number>({
  success() {
    reload();
  },
});

const onDelete = async (id: number) => {
  return deleteEnumItem(route.params.enumId as unknown as number, id).then(() => {
    ElMessage.success(t('common.deleteSuccess'));
    reload();
  });
};

const visible = ref(false);

defineExpose({
  open(id: number) {
    enumId.value = id;
    upsert.setData(id);
    visible.value = true;

    nextTick(() => {
      reload();
    });
  },
});
</script>
