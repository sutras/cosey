import { defineComponent } from 'vue';
import { ElButton } from 'element-plus';
import { useClipboard } from '@vueuse/core';
import { copyProps } from './copy.api';
import Icon from '../icon';
import { RtiCheck, RtiCopy } from 'richtext-icons';
import { createBem } from '../../utils';

export default defineComponent({
  name: 'CoCopy',
  props: copyProps,
  setup(props) {
    const bem = createBem('copy');

    const { copy, copied } = useClipboard();

    return () => {
      return (
        <ElButton
          link
          type={props.type}
          class={[bem.b(), bem.is('copied', copied.value)]}
          style={{ color: props.color }}
          onClick={() => copy(props.text || '')}
        >
          <Icon class={bem.e('icon')}>{copied.value ? <RtiCheck /> : <RtiCopy />}</Icon>
        </ElButton>
      );
    };
  },
});
