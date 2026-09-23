import { defineComponent } from 'vue';
import { createBem } from '../../../utils';

export default defineComponent({
  name: 'CoEditorToolbar',
  setup(props, { slots }) {
    void props;

    const bem = createBem('editor');

    return () => {
      return <div class={bem.e('toolbar')}>{slots.default?.()}</div>;
    };
  },
});
