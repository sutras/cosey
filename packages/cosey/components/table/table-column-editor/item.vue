<template>
  <div ref="itemRef" v-bind="itemBinder" :class="[bem.e('item'), bem.is('pressing', isPressing)]">
    <div :class="bem.e('item-content')">
      <el-checkbox
        :model-value="node.checkedStatus === 'checked'"
        :indeterminate="node.checkedStatus === 'indeterminate'"
        @change="onCheckChange($event, node)"
      />
      <div v-if="!disabled" ref="holderRef" v-bind="holderBinder" :class="bem.e('item-holder')">
        <Icon size="lg"><RtiDragHandle /></Icon>
      </div>
      <div :class="bem.e('item-label')">
        {{ column.label }}
      </div>
      <div v-if="!isSub" :class="bem.e('item-pins')">
        <el-button
          link
          :style="{ border: 0 }"
          :type="column.fixed === true || column.fixed === 'left' ? 'primary' : ''"
          @click="onFixedLeft(column)"
        >
          <Icon size="lg">
            <component :is="isFixedLeft ? RtiPinFilled : RtiPin" />
          </Icon>
        </el-button>
        <el-button
          link
          :style="{ border: 0, marginInlineStart: 0 }"
          :type="column.fixed === 'right' ? 'primary' : ''"
          @click="onFixedRight(column)"
        >
          <Icon size="lg" style="transform: scaleX(-1)">
            <component :is="isFixedRight ? RtiPinFilled : RtiPin" />
          </Icon>
        </el-button>
      </div>
    </div>
    <List v-if="node.children && node.children.length" :node-list="node.children" is-sub />
  </div>
</template>

<script setup lang="ts">
import { reactive, toRef } from 'vue';
import { useDndSortItem } from '../../dnd-sort';
import { Icon } from '../../icon';
import { type TableColumnProps } from '../table-column/table-column.api';
import List from './list.vue';
import { createBem } from '../../../utils';
import { useTreeCheckInject, type CheckableNode } from '../../../hooks';
import { computed } from 'vue';
import { ElButton } from 'element-plus';
import { RtiDragHandle, RtiPin, RtiPinFilled } from 'richtext-icons';

const props = defineProps<{
  node: CheckableNode<TableColumnProps>;
  index: number;
  isSub?: boolean;
}>();

const bem = createBem('table-column-editor');

const column = computed(() => props.node.data);

const isFixedLeft = computed(() => column.value.fixed === true || column.value.fixed === 'left');

const isFixedRight = computed(() => column.value.fixed === 'right');

// drag
const { disabled, itemRef, holderRef, itemBinder, holderBinder, isPressing } = useDndSortItem(
  reactive({
    index: toRef(() => props.index),
  }),
);

// check
const { onCheckChange } = useTreeCheckInject();

// fixed
const onFixedLeft = (column: TableColumnProps) => {
  column.fixed = column.fixed === true || column.fixed === 'left' ? false : 'left';
};

const onFixedRight = (column: TableColumnProps) => {
  column.fixed = column.fixed === 'right' ? false : 'right';
};
</script>
