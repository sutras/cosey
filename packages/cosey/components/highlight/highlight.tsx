import { computed, defineComponent } from 'vue';
import { ElScrollbar } from 'element-plus';
import { Prism, highlightProps, highlightSlots } from './highlight.api';
import { Copy } from '../copy';
import { createBem } from '../../utils';

export default defineComponent({
  name: 'CoHighlight',
  props: highlightProps,
  slots: highlightSlots,
  setup(props) {
    const bem = createBem('highlight');

    const highlightedCode = computed(() =>
      Prism.highlight(
        props.code || '',
        Prism.languages[props.lang] || Prism.languages['text'],
        props.lang,
      ),
    );

    return () => {
      return (
        <div class={bem.b()}>
          <ElScrollbar
            tag="pre"
            class={bem.e('scroll')}
            view-class={`language-${props.lang}`}
            maxHeight={props.maxHeight}
          >
            <code class={`language-${props.lang}`} innerHTML={highlightedCode.value}></code>
          </ElScrollbar>
          <div class={bem.e('copy')}>
            <Copy text={props.code} />
          </div>
        </div>
      );
    };
  },
});
