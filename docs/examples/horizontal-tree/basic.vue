<template>
  <co-horizontal-tree
    ref="tree"
    v-loading="isFetching"
    show-checkbox
    node-key="id"
    :data="permissionTree"
    :props="{
      children: 'children',
      label: 'name',
    }"
  />
</template>

<script lang="ts" setup>
import permissionsApi from '@/api/permissions';
import rolesApi from '@/api/roles';
import { type HorizontalTreeExpose } from 'cosey/components';
import { useFetch } from 'cosey/hooks';
import { nextTick, ref, useTemplateRef } from 'vue';

const { getPermissionTree } = permissionsApi;
const { getRolePermissions } = rolesApi;

const treeRef = useTemplateRef<HorizontalTreeExpose>('tree');

const permissionTree = ref();

const { isFetching, execute } = useFetch<void, number>(
  async (id) => {
    const [permTree, rolePermissions] = await Promise.all([
      getPermissionTree(),
      getRolePermissions(id),
    ]);

    permissionTree.value = permTree;
    nextTick(() => {
      treeRef.value?.setCheckedKeys(rolePermissions);
    });
  },
  {
    immediate: false,
  },
);

execute(1);
</script>
