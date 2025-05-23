<template>
  <div
    ref="itemRef"
    v-bind="itemBinder"
    :class="[
      `${prefixCls}-item`,
      {
        'is-pressing': isPressing,
      },
    ]"
  >
    <div :class="`${prefixCls}-item-content`">
      <el-checkbox
        :model-value="node.checkedStatus === 'checked'"
        :indeterminate="node.checkedStatus === 'indeterminate'"
        @change="onCheckChange($event, node)"
      />
      <div
        v-if="!disabled"
        ref="holderRef"
        v-bind="holderBinder"
        :class="`${prefixCls}-item-holder`"
      >
        <Icon name="co:draggable" size="lg" />
      </div>
      <div :class="`${prefixCls}-item-label`">
        {{ column.label }}
      </div>
      <div v-if="!isSub" :class="`${prefixCls}-item-pins`">
        <el-button
          link
          :style="{ border: 0 }"
          :type="column.fixed === true || column.fixed === 'left' ? 'primary' : ''"
          @click="onFixedLeft(column)"
        >
          <Icon
            size="lg"
            :name="column.fixed === true || column.fixed === 'left' ? 'co:pin-filled' : 'co:pin'"
          />
        </el-button>
        <el-button
          link
          :style="{ border: 0, marginInlineStart: 0 }"
          :type="column.fixed === 'right' ? 'primary' : ''"
          @click="onFixedRight(column)"
        >
          <Icon
            size="lg"
            :name="column.fixed === 'right' ? 'co:pin-filled' : 'co:pin'"
            style="transform: scaleX(-1)"
          />
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
import { type TableColumnProps } from '../table-column/table-column';
import List from './list.vue';
import { useComponentConfig } from '../../config-provider';
import { useTreeCheckInject, type CheckableNode } from '../../../hooks';
import { computed } from 'vue';
import { ElButton } from 'element-plus';

const props = defineProps<{
  node: CheckableNode<TableColumnProps>;
  index: number;
  isSub?: boolean;
}>();

const { prefixCls } = useComponentConfig('table-column-editor');

const column = computed(() => props.node.data);

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
