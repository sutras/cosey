import { defineComponent, h, type Component, type PropType } from 'vue';
import { Icon } from '../../icon';
import Button from '../button';
import { useBlockValueActive } from '../hooks/useBlockValueActive';
import { useLocale } from '../../../hooks';
import { useEditor } from '../pm/context';
import { type FormatAlign } from '../types';

const TITLE_KEYS: Record<FormatAlign, string> = {
  left: 'co.editor.alignLeft',
  center: 'co.editor.alignCenter',
  right: 'co.editor.alignRight',
  justify: 'co.editor.alignJustify',
  start: 'co.editor.alignLeft',
  end: 'co.editor.alignRight',
};

export default defineComponent({
  name: 'CoEditorFormatAlign',
  props: {
    icon: {
      type: [Object, Function] as PropType<Component>,
      required: true,
    },
    format: {
      type: String as PropType<FormatAlign>,
      required: true,
    },
    label: { type: String },
  },
  setup(props) {
    const editor = useEditor();
    const { t } = useLocale();

    const isActive = useBlockValueActive('align', props.format);

    const onClick = () => {
      editor.formatAlign(props.format);
    };

    return () => {
      return (
        <Button
          active={isActive.value}
          label={props.label}
          title={props.label ?? t(TITLE_KEYS[props.format])}
          onClick={onClick}
        >
          <Icon>{h(props.icon)}</Icon>
        </Button>
      );
    };
  },
});
