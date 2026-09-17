import { defineComponent } from 'vue';
import Button from '../button';
import { Icon } from '../../icon';
import { isString } from '../../../utils';
import { useEditor } from '../pm/context';

export default defineComponent({
  name: 'CoEditorFormatSizeDelta',
  props: {
    icon: { type: String, required: true },
    delta: { type: Number, required: true },
  },
  emits: {
    change: (size: string) => isString(size),
  },
  setup(props, { emit }) {
    const editor = useEditor();

    const onClick = () => {
      editor.formatSizeDelta(props.delta, (numSize) => {
        emit('change', numSize + 'px');
      });
    };

    return () => {
      return (
        <Button onClick={onClick}>
          <Icon name={props.icon} />
        </Button>
      );
    };
  },
});
