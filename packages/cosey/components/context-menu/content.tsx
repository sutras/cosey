import { defineComponent, h, useTemplateRef } from 'vue';
import { Icon } from '../icon';
import { createBem, isString } from '../../utils';
import { contextMenuContentProps, contextMenuContentSlots } from './content.api';
import { RtiChevronRight } from 'richtext-icons';

export default defineComponent({
  props: contextMenuContentProps,
  slots: contextMenuContentSlots,
  setup(props, { attrs, slots, expose }) {
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
