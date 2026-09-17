import { defineComponent } from 'vue';
import { createBem } from '../../../utils';
import { useLocale } from '../../../hooks';

export default defineComponent({
  name: 'CoEditorContentPlaceholder',
  props: {
    visible: { type: Boolean, default: true },
    text: { type: String },
  },
  setup(props) {
    const bem = createBem('editor-content-placeholder');
    const { t } = useLocale();

    return () => {
      if (!props.visible) return null;
      return <div class={bem.b()}>{props.text || t('co.common.pleaseInput')}</div>;
    };
  },
});
