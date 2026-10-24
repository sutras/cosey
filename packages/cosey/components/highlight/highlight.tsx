import { defineComponent } from 'vue';
import { ElScrollbar } from 'element-plus';
import { Prism, highlightProps, highlightSlots } from './highlight.api';
import { Copy } from '../copy';
import { createBem, getVNodeText } from '../../utils';

export default defineComponent({
  name: 'CoHighlight',
  props: highlightProps,
  slots: highlightSlots,
  setup(props, { slots }) {
    const bem = createBem('highlight');

    return () => {
      // 默认插槽与 `code` 等价：取插槽里的纯文本
      const code = props.code || getVNodeText(slots.default?.({}) ?? '');

      const highlightedCode = Prism.highlight(
        code,
        Prism.languages[props.lang] || Prism.languages['text'],
        props.lang,
      );

      return (
        <div class={bem.b()}>
          <ElScrollbar
            tag="pre"
            class={bem.e('scroll')}
            view-class={`language-${props.lang}`}
            maxHeight={props.maxHeight}
          >
            <code class={`language-${props.lang}`} innerHTML={highlightedCode}></code>
          </ElScrollbar>
          {code ? (
            <div class={bem.e('copy')}>
              <Copy text={code} />
            </div>
          ) : null}
        </div>
      );
    };
  },
});
