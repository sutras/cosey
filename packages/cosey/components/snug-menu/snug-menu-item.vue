<template>
  <div
    :class="[
      bem.b(),
      bem.is('disabled', disabled),
      bem.is('active', isActive),
      bem.is(context.mode),
    ]"
    @click="onClick"
  >
    <Icon v-if="icon" :name="icon" size="lg" :class="bem.e('icon')" />
    <div :class="bem.e('title')" :title="title">
      {{ title }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import {
  type SnugMenuItemEmits,
  type SnugMenuItemProps,
  type SnugMenuItemSlots,
} from './snug-menu-item';
import { type SnugMenuContext, snugMenuContextSymbol } from './snug-menu';
import { Icon } from '../icon';
import { createBem } from '../../utils';
import { useI18n } from 'vue-i18n';

defineOptions({
  name: 'CoSnugMenuItem',
});

const props = defineProps<SnugMenuItemProps>();

defineSlots<SnugMenuItemSlots>();

const emit = defineEmits<SnugMenuItemEmits>();

const { t } = useI18n();

const bem = createBem('snug-menu-item');

const context = inject<SnugMenuContext>(snugMenuContextSymbol)!;

const isActive = computed(() => !!props.name && context.activeName === props.name);

const title = computed(() => t(props.title ?? ''));

const onClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event);
    context.select(props.name);
  }
};
</script>
