import { defineComponent, h } from 'vue';
import { Icon } from '../icon';
import { createBem, isString } from '../../utils';
import { contextMenuContentProps } from './content.api';
import { RtiChevronRight } from 'richtext-icons';

export default defineComponent({
  props: contextMenuContentProps,
  setup(props, { attrs }) {
    const bem = createBem('context-menu');

    return () => {
      return (
        <div
          ref="item"
          {...attrs}
          class={[
            bem.e('content'),
            bem.is('disabled', props.disabled),
            bem.is('hover', props.hover),
          ]}
        >
          {props.withIcon && (
            <div class={bem.e('content-icon')}>
              {props.icon &&
                (isString(props.icon) ? <Icon name={props.icon} /> : <Icon>{h(props.icon)}</Icon>)}
            </div>
          )}
          <span class={bem.e('content-title')}>{props.title}</span>
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
