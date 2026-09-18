import { dndSortItemProps, dndSortItemSlots } from './dnd-sort-item.api';
import { defineComponent, reactive, toRef } from 'vue';
import { useDndSortItem } from './useDndSortItem';
import { Icon } from '../icon';
import { createBem } from '../../utils';
import { RtiDragHandle } from 'richtext-icons';

export default defineComponent({
  name: 'CoDndSortItem',
  props: dndSortItemProps,
  slots: dndSortItemSlots,
  setup(props, { slots }) {
    const bem = createBem('dnd-sort');

    const { disabled, itemRef, holderRef, itemBinder, holderBinder } = useDndSortItem(
      reactive({
        index: toRef(() => props.index!),
      }),
    );

    return () => {
      return (
        <div ref={itemRef} {...itemBinder}>
          <div class={bem.e('item')}>
            {slots.prepend?.({})}
            {!disabled.value && (
              <div ref={holderRef} {...holderBinder} class={bem.e('item-holder')}>
                <Icon size="lg">
                  <RtiDragHandle />
                </Icon>
              </div>
            )}
            <div class={bem.e('item-content')}>{slots.default?.({})}</div>
          </div>
        </div>
      );
    };
  },
});
