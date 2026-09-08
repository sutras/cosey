import { defineComponent, useModel } from 'vue';
import { useEditor, useElement } from 'slate-vue3';
import { DOMEditor } from 'slate-vue3/dom';
import { isString } from '../../../utils';
import { languageOptions } from '../plugins/code-block';

export default defineComponent({
  name: 'CoEditorContentCodeBlock',
  props: {
    language: {
      type: String,
      default: 'text',
    },
  },
  emits: {
    'update:value': (value: string) => isString(value),
  },
  setup(props, { slots }) {
    const language = useModel(props, 'language');
    const editor = useEditor();

    const element = useElement();

    const onChange = (e: Event) => {
      language.value = (e.target as HTMLSelectElement).value;

      const path = DOMEditor.findPath(editor, element.value);
      editor.setNodes({ language: language.value }, { at: path });
    };

    return () => {
      return (
        <pre class={`language-${language.value}`}>
          <code class={`language-${language.value}`}>
            <select value={language.value} contenteditable={false} onChange={onChange}>
              {languageOptions.map((option) => (
                <option value={option.value}>{option.label}</option>
              ))}
            </select>
            <div>{slots.default?.()}</div>
          </code>
        </pre>
      );
    };
  },
});
