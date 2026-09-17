import { defineComponent, type PropType } from 'vue';
import { Icon } from '../../icon';
import Button from '../button';
import { useBlockValueActive } from '../hooks/useBlockValueActive';
import { useEditor } from '../pm/context';
import { type FormatAlign } from '../types';

export default defineComponent({
  name: 'CoEditorFormatAlign',
  props: {
    icon: {
      type: String,
      required: true,
    },
    format: {
      type: String as PropType<FormatAlign>,
      required: true,
    },
  },
  setup(props) {
    const editor = useEditor();

    const isActive = useBlockValueActive('align', props.format);

    const onClick = () => {
      editor.formatAlign(props.format);
    };

    return () => {
      return (
        <Button active={isActive.value} onClick={onClick}>
          <Icon name={props.icon} />
        </Button>
      );
    };
  },
});
