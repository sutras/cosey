import { computed, defineComponent, h, type Component, type PropType } from 'vue';
import { Icon } from '../../icon';
import Button from '../button';
import { useLocale } from '../../../hooks';
import { useEditor } from '../pm/context';
import { type ListType } from '../types';

const TITLE_KEYS: Record<ListType, string> = {
  'numbered-list': 'co.editor.orderedList',
  'bulleted-list': 'co.editor.bulletList',
};

export default defineComponent({
  name: 'CoEditorFormatList',
  props: {
    icon: { type: [Object, Function] as PropType<Component>, required: true },
    format: { type: String as PropType<ListType>, required: true },
    label: { type: String },
  },
  setup(props) {
    const editor = useEditor();
    const { t } = useLocale();

    const isListActive = computed(() => {
      void editor.version.value;
      return editor.getListType() === props.format;
    });

    const onClick = () => {
      editor.formatList(props.format);
    };

    return () => {
      return (
        <Button
          active={isListActive.value}
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
