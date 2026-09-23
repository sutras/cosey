import { defineComponent, h, useTemplateRef } from 'vue';
import { Icon } from '../icon';
import { createBem, isString } from '../../utils';
import {
  contextMenuContentEmits,
  contextMenuContentProps,
  contextMenuContentSlots,
} from './content.api';
import { RtiChevronRight } from 'richtext-icons';

export default defineComponent({
  name: 'CoContextMenuContent',
  props: contextMenuContentProps,
  slots: contextMenuContentSlots,
  emits: contextMenuContentEmits,
  setup(props, { attrs, slots, emit, expose }) {
    const bem = createBem('context-menu');

    const itemRef = useTemplateRef<HTMLElement>('item');

    expose({ el: itemRef });

    return () => {
      return (
        <div
          ref="item"
          {...attrs}
          class={[
            bem.e('content'),
            bem.is('disabled', props.disabled),
            bem.is('hover', props.hover),
            bem.is('active', props.active),
          ]}
          onClick={(event) => emit('click', event)}
        >
          {slots.icon ? (
            <div class={bem.e('content-icon')}>{slots.icon({})}</div>
          ) : (
            props.withIcon && (
              <div class={bem.e('content-icon')}>
                {props.icon &&
                  (isString(props.icon) ? (
                    <Icon name={props.icon} />
                  ) : (
                    <Icon>{h(props.icon)}</Icon>
                  ))}
              </div>
            )
          )}
          {slots.default ? (
            <div class={bem.e('content-body')}>{slots.default({})}</div>
          ) : (
            <span class={bem.e('content-title')}>{props.title}</span>
          )}
          <div class={bem.e('content-arrow')}>
            {props.arrow && (
              <Icon class={bem.e('content-arrow-icon')} size="lg">
                <RtiChevronRight />
              </Icon>
            )}
          </div>
        </div>
      );
    };
  },
});
