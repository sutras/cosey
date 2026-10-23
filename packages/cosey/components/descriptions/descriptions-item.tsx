import { defineComponent } from 'vue';
import {
  descriptionsItemEmits,
  descriptionsItemProps,
  descriptionsItemSlots,
} from './descriptions.api';

/**
 * 只作为数据载体：标签、span 与内容由 `co-descriptions` 读取后统一排版，
 * 自身不产出 DOM。
 */
export default defineComponent({
  name: 'CoDescriptionsItem',
  props: descriptionsItemProps,
  slots: descriptionsItemSlots,
  emits: descriptionsItemEmits,
  setup() {
    return () => null;
  },
});
