import { defineComponent } from 'vue';
import { Icon } from '../../icon';
import Button from '../button';
import { useEditor } from '../pm/context';
import { RtiClearFormat } from 'richtext-icons';

export default defineComponent({
  name: 'CoEditorFormatClear',
  setup() {
    const editor = useEditor();

    const onClick = () => {
      editor.clearFormats();
    };

    return () => {
      return (
        <Button onClick={onClick}>
          <Icon>
            <RtiClearFormat />
          </Icon>
        </Button>
      );
    };
  },
});
