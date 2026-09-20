import { defineComponent, h, type Component, type PropType } from 'vue';
import { Icon } from '../../icon';
import Button from '../button';
import { useLocale } from '../../../hooks';
import { useEditor } from '../pm/context';

export default defineComponent({
  name: 'CoEditorFormatIndent',
  props: {
    icon: { type: [Object, Function] as PropType<Component>, required: true },
    delta: { type: Number, required: true },
    label: { type: String },
  },
  setup(props) {
    const editor = useEditor();
    const { t } = useLocale();

    const onClick = () => {
      editor.formatIndent(props.delta);
    };

    return () => {
      return (
        <Button
          label={props.label}
          title={
            props.label ??
            t(props.delta > 0 ? 'co.editor.increaseIndent' : 'co.editor.decreaseIndent')
          }
          onClick={onClick}
        >
          <Icon>{h(props.icon)}</Icon>
        </Button>
      );
    };
  },
});
