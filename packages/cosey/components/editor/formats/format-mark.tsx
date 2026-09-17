import { defineComponent } from 'vue';
import { Icon } from '../../icon';
import Button from '../button';
import { useEditor } from '../pm/context';
import { useMarkActive } from '../hooks/useMarkActive';

export default defineComponent({
  name: 'CoEditorFormatMark',
  props: {
    icon: { type: String, required: true },
    format: { type: String, required: true },
  },
  setup(props) {
    const editor = useEditor();
    const isMarkActive = useMarkActive(props.format);

    const onClick = () => {
      editor.toggleMark(props.format);
    };

    return () => {
      return (
        <Button active={isMarkActive.value} onClick={onClick}>
          <Icon name={props.icon} />
        </Button>
      );
    };
  },
});
