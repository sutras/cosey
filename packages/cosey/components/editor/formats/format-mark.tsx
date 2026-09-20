import { defineComponent, h, type Component, type PropType } from 'vue';
import { Icon } from '../../icon';
import Button from '../button';
import { useLocale } from '../../../hooks';
import { useEditor } from '../pm/context';
import { useMarkActive } from '../hooks/useMarkActive';

/** format 值到 i18n key 的映射，用于按钮的 hover 文字提示 */
const TITLE_KEYS: Record<string, string> = {
  bold: 'co.editor.bold',
  italic: 'co.editor.italic',
  underline: 'co.editor.underline',
  strikethrough: 'co.editor.strikethrough',
  code: 'co.editor.inlineCode',
  superscript: 'co.editor.superscript',
  subscript: 'co.editor.subscript',
};

export default defineComponent({
  name: 'CoEditorFormatMark',
  props: {
    icon: { type: [Object, Function] as PropType<Component>, required: true },
    format: { type: String, required: true },
    label: { type: String },
  },
  setup(props) {
    const editor = useEditor();
    const { t } = useLocale();
    const isMarkActive = useMarkActive(props.format);

    const titleKey = TITLE_KEYS[props.format];

    const onClick = () => {
      editor.toggleMark(props.format);
    };

    return () => {
      return (
        <Button
          active={isMarkActive.value}
          label={props.label}
          title={props.label ?? (titleKey ? t(titleKey) : undefined)}
          onClick={onClick}
        >
          <Icon>{h(props.icon)}</Icon>
        </Button>
      );
    };
  },
});
