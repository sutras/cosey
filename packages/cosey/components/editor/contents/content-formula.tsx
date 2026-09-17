import { computed, defineComponent, type PropType } from 'vue';
import { type Node as PMNode } from 'prosemirror-model';
import { type EditorView } from 'prosemirror-view';
import katex from 'katex';
import { createBem } from '../../../utils';

export default defineComponent({
  name: 'CoEditorContentFormula',
  props: {
    node: { type: Object as PropType<PMNode>, required: true },
    view: { type: Object as PropType<EditorView>, required: true },
    getPos: { type: Function as PropType<() => number | undefined>, required: true },
    selected: { type: Boolean },
    registerEl: {
      type: Function as PropType<(el: HTMLElement | null) => void>,
      required: true,
    },
  },
  setup(props) {
    const bem = createBem('editor-content-formula');

    void props.view;
    void props.getPos;

    const mathml = computed(() =>
      katex.renderToString((props.node.attrs.formula as string) || '', {
        throwOnError: false,
        output: 'mathml',
      }),
    );

    return () => {
      return (
        <span
          ref={(el) => props.registerEl(el as HTMLElement | null)}
          class={[bem.b(), bem.is('active', props.selected)]}
        >
          <span v-html={mathml.value} contenteditable={false}></span>
        </span>
      );
    };
  },
});
