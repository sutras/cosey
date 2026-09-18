import { computed, defineComponent, h, type Component, type PropType } from 'vue';
import { Icon } from '../../icon';
import Button from '../button';
import { useEditor } from '../pm/context';
import { type ListType } from '../types';

export default defineComponent({
  name: 'CoEditorFormatList',
  props: {
    icon: { type: [Object, Function] as PropType<Component>, required: true },
    format: { type: String as PropType<ListType>, required: true },
  },
  setup(props) {
    const editor = useEditor();

    const isListActive = computed(() => {
      void editor.version.value;
      return editor.getListType() === props.format;
    });

    const onClick = () => {
      editor.formatList(props.format);
    };

    return () => {
      return (
        <Button active={isListActive.value} onClick={onClick}>
          <Icon>{h(props.icon)}</Icon>
        </Button>
      );
    };
  },
});
