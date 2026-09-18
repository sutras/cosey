import { Icon } from '../icon';
import { fileCardProps, fileCardSlots } from './file-card.api';
import { createBem } from '../../utils';
import { defineComponent } from 'vue';
import { RtiDocument } from 'richtext-icons';

export default defineComponent({
  name: 'CoFileCard',
  props: fileCardProps,
  slots: fileCardSlots,
  setup(props) {
    const bem = createBem('file-card');

    return () => {
      return (
        <div class={[bem.b(), bem.is(props.size)]} title={props.title || props.src}>
          <Icon>
            <RtiDocument />
          </Icon>
          <div class={bem.e('filename')}>{props.name}</div>
        </div>
      );
    };
  },
});
