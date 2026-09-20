import { defineComponent } from 'vue';
import { Icon } from '../../icon';
import Button from '../button';
import { useLocale } from '../../../hooks';
import { useEditor } from '../pm/context';
import { RtiClearFormat } from 'richtext-icons';

export default defineComponent({
  name: 'CoEditorFormatClear',
  setup() {
    const { t } = useLocale();
    const editor = useEditor();

    const onClick = () => {
      editor.clearFormats();
    };

    return () => {
      return (
        <Button title={t('co.editor.clearFormat')} onClick={onClick}>
          <Icon>
            <RtiClearFormat />
          </Icon>
        </Button>
      );
    };
  },
});
