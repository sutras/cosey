<template>
  <div :class="[hashId, prefixCls]">
    <MediaCard v-for="(item, i) in mergedSrcset" :key="i" v-bind="item" :size="size" />
  </div>
</template>

<script setup lang="ts">
import {
  type MediaCardGroupProps,
  type MediaCardGroupSlots,
  type MediaCardGroupEmits,
  type MediaCardGroupExpose,
} from './media-card-group';
import useStyle from './style';
import { useComponentConfig } from '../config-provider';
import { type MediaCardBaseProps } from '../media-card/media-card';
import MediaCard from '../media-card/media-card.vue';
import { computed } from 'vue';
import { isString } from '../../utils';

defineOptions({
  name: 'MediaCardGroup',
});

const props = defineProps<MediaCardGroupProps>();

defineSlots<MediaCardGroupSlots>();

defineEmits<MediaCardGroupEmits>();

const { prefixCls } = useComponentConfig('media-card-group', props);

const { hashId } = useStyle(prefixCls);

const mergedSrcset = computed(() => {
  if (isString(props.srcset)) {
    return [
      {
        src: props.srcset,
      },
    ];
  }
  if (Array.isArray(props.srcset)) {
    return props.srcset.map((item) => {
      if (isString(item)) {
        return {
          src: item,
        };
      }
      return item as MediaCardBaseProps;
    });
  }
  return [];
});

defineExpose<MediaCardGroupExpose>();
</script>
