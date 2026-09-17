import { defineComponent, type PropType } from 'vue';
import { type Node as PMNode } from 'prosemirror-model';
import { type EditorView } from 'prosemirror-view';
import { isString } from '../../../utils';

export const languageOptions = [
  { value: 'text', label: 'PlainText' },
  { value: 'css', label: 'CSS' },
  { value: 'less', label: 'Less' },
  { value: 'scss', label: 'Scss' },
  { value: 'html', label: 'HTML' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'jsx', label: 'JSX' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'tsx', label: 'TSX' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'php', label: 'PHP' },
  { value: 'bash', label: 'Bash' },
  { value: 'java', label: 'Java' },
  { value: 'python', label: 'Python' },
  { value: 'sql', label: 'SQL' },
];

export default defineComponent({
  name: 'CoEditorContentCodeBlock',
  props: {
    node: { type: Object as PropType<PMNode>, required: true },
    view: { type: Object as PropType<EditorView>, required: true },
    getPos: { type: Function as PropType<() => number | undefined>, required: true },
    selected: { type: Boolean },
    registerEl: {
      type: Function as PropType<(el: HTMLElement | null) => void>,
      required: true,
    },
    registerContent: {
      type: Function as PropType<(el: HTMLElement | null) => void>,
      required: true,
    },
  },
  emits: {
    'update:value': (value: string) => isString(value),
  },
  setup(props) {
    void props.selected;
    void props.view;

    const language = () => (props.node.attrs.language as string) || 'text';

    const onChange = (event: Event) => {
      const value = (event.target as HTMLSelectElement).value;
      const pos = props.getPos();
      if (pos == null) return;

      props.view.dispatch(
        props.view.state.tr.setNodeMarkup(pos, undefined, {
          ...props.node.attrs,
          language: value,
        }),
      );
    };

    return () => {
      const value = language();
      return (
        <pre ref={(el) => props.registerEl(el as HTMLElement | null)} class={`language-${value}`}>
          <code class={`language-${value}`}>
            <select value={value} contenteditable={false} onChange={onChange}>
              {languageOptions.map((option) => (
                <option value={option.value}>{option.label}</option>
              ))}
            </select>
            <div ref={(el) => props.registerContent(el as HTMLElement | null)}></div>
          </code>
        </pre>
      );
    };
  },
});
