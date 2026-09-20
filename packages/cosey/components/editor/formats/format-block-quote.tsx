import { computed, defineComponent } from 'vue';
import { Icon } from '../../icon';
import Button from '../button';
import { useLocale } from '../../../hooks';
import { useEditor } from '../pm/context';
import { RtiQuote } from 'richtext-icons';

export default defineComponent({
  name: 'CoEditorFormatBlockQuote',
  props: {
    label: { type: String },
  },
  setup(props) {
    const editor = useEditor();
    const { t } = useLocale();

    const isActive = computed(() => {
      void editor.version.value;
      return editor.isBlockQuoteActive();
    });

    const onClick = () => {
      editor.formatBlockQuote();
    };

    return () => {
      return (
        <Button
          active={isActive.value}
          label={props.label}
          title={props.label ?? t('co.editor.blockQuote')}
          onClick={onClick}
        >
          <Icon>
            <RtiQuote />
          </Icon>
        </Button>
      );
    };
  },
});
