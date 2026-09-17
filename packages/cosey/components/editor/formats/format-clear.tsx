import { defineComponent } from 'vue';
import { Icon } from '../../icon';
import Button from '../button';
import { useEditor } from '../pm/context';

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
          <Icon name="co:text-clear-format" />
        </Button>
      );
    };
  },
});
