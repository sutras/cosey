import { defineComponent, h, type Component, type PropType } from 'vue';
import { Icon } from '../../icon';
import Button from '../button';
import { useEditor } from '../pm/context';
import { useMarkActive } from '../hooks/useMarkActive';

export default defineComponent({
  name: 'CoEditorFormatMark',
  props: {
    icon: { type: [Object, Function] as PropType<Component>, required: true },
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
          <Icon>{h(props.icon)}</Icon>
        </Button>
      );
    };
  },
});
