import { defineComponent } from 'vue';
import { useClipboard } from '@vueuse/core';
import { RtiCheck, RtiCopy } from 'richtext-icons';
import { copyProps } from './copy.api';
import Icon from '../icon';
import { useLocale } from '../../hooks';
import { createBem } from '../../utils';

export default defineComponent({
  name: 'CoCopy',
  props: copyProps,
  setup(props) {
    const bem = createBem('copy');

    const { t } = useLocale();

    const { copy, copied } = useClipboard();

    return () => (
      <button
        type="button"
        class={[bem.b(), bem.m(props.type, !!props.type), bem.is('copied', copied.value)]}
        style={props.color ? { color: props.color } : undefined}
        aria-label={props.label || t('co.common.copy')}
        onClick={() => copy(props.text || '')}
      >
        <Icon class={bem.e('icon')}>{copied.value ? <RtiCheck /> : <RtiCopy />}</Icon>
      </button>
    );
  },
});
