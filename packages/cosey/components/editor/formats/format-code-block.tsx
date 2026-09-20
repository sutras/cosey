import { computed, defineComponent } from 'vue';
import { Icon } from '../../icon';
import Button from '../button';
import { useLocale } from '../../../hooks';
import { useEditor } from '../pm/context';
import { RtiCodeBlock } from 'richtext-icons';

export default defineComponent({
  name: 'CoEditorFormatCodeBlock',
  props: {
    label: { type: String },
  },
  setup(props) {
    const editor = useEditor();
    const { t } = useLocale();

    const isActive = computed(() => {
      void editor.version.value;
      return editor.isCodeBlockActive();
    });

    const onClick = () => {
      editor.formatCodeBlock();
    };

    return () => {
      return (
        <Button
          active={isActive.value}
          label={props.label}
          title={props.label ?? t('co.editor.codeBlock')}
          onClick={onClick}
        >
          <Icon>
            <RtiCodeBlock />
          </Icon>
        </Button>
      );
    };
  },
});
