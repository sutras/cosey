import { defineComponent } from 'vue';
import { Icon } from '../icon';
import { closeEmits } from './close.api';
import { createBem } from '../../utils';
import { RtiClose } from 'richtext-icons';

export default defineComponent({
  name: 'CoClose',
  emits: closeEmits,
  setup(_props, { emit }) {
    const bem = createBem('close');

    return () => {
      return (
        <span class={bem.b()} onClick={(event) => emit('click', event)}>
          <Icon>
            <RtiClose />
          </Icon>
        </span>
      );
    };
  },
});
