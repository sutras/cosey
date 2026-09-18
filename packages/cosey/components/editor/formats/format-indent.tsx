import { defineComponent, h, type Component, type PropType } from 'vue';
import { Icon } from '../../icon';
import Button from '../button';
import { useEditor } from '../pm/context';

export default defineComponent({
  name: 'CoEditorFormatIndent',
  props: {
    icon: { type: [Object, Function] as PropType<Component>, required: true },
    delta: { type: Number, required: true },
  },
  setup(props) {
    const editor = useEditor();

    const onClick = () => {
      editor.formatIndent(props.delta);
    };

    return () => {
      return (
        <Button onClick={onClick}>
          <Icon>{h(props.icon)}</Icon>
        </Button>
      );
    };
  },
});
