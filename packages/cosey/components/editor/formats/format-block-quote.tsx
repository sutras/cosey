import { computed, defineComponent } from 'vue';
import { Icon } from '../../icon';
import Button from '../button';
import { useEditor } from '../pm/context';

export default defineComponent({
  name: 'CoEditorFormatBlockQuote',
  setup() {
    const editor = useEditor();

    const isActive = computed(() => {
      void editor.version.value;
      return editor.isBlockQuoteActive();
    });

    const onClick = () => {
      editor.formatBlockQuote();
    };

    return () => {
      return (
        <Button active={isActive.value} onClick={onClick}>
          <Icon name="co:quotes" />
        </Button>
      );
    };
  },
});
