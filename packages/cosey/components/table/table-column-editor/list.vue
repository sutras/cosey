<template>
  <div :class="`${prefixCls}-list`">
    <InternalTransitionGroup :css="false" effect="slide">
      <Item
        v-for="(node, i) in nodeList"
        :node="node"
        :key="getTargetKey(node)"
        :index="i"
        :is-sub="isSub"
      />
    </InternalTransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useDndSort } from '../../dnd-sort';
import { TransitionGroup as InternalTransitionGroup } from '../../transition-group';
import { type TableColumnProps } from '../table-column/table-column.api';
import Item from './item.vue';
import { watch } from 'vue';
import { auid, arrayMove } from '../../../utils';
import { useComponentConfig } from '../../config-provider';
import { type CheckableNode } from '../../../hooks';

const props = defineProps<{
  nodeList: CheckableNode<TableColumnProps>[];
  isSub?: boolean;
}>();

const { prefixCls } = useComponentConfig('table-column-editor');

// key - 用于拖拽
let mapTargetKey = new Map<object, string>();

const getTargetKey = (target: object) => {
  return mapTargetKey.get(target) as string;
};

watch(
  () => props.nodeList,
  () => {
    const newMapTargetKey = new Map<object, string>();

    props.nodeList.forEach((node) => {
      let key = mapTargetKey.get(node);
      if (!key) {
        key = auid();
      }
      newMapTargetKey.set(node, key);
    });

    mapTargetKey = newMapTargetKey;
  },
  {
    immediate: true,
    flush: 'sync',
  },
);

useDndSort({
  onMove(fromIndex, toIndex) {
    arrayMove(props.nodeList, fromIndex, toIndex);
  },
});
</script>
