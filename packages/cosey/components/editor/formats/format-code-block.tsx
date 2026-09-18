import { computed, defineComponent } from 'vue';
import { Icon } from '../../icon';
import Button from '../button';
import { useEditor } from '../pm/context';
import { RtiCodeBlock } from 'richtext-icons';

export default defineComponent({
  name: 'CoEditorFormatCodeBlock',
  setup() {
    const editor = useEditor();

    const isActive = computed(() => {
      void editor.version.value;
      return editor.isCodeBlockActive();
    });

    const onClick = () => {
      editor.formatCodeBlock();
    };

    return () => {
      return (
        <Button active={isActive.value} onClick={onClick}>
          <Icon>
            <RtiCodeBlock />
          </Icon>
        </Button>
      );
    };
  },
});
