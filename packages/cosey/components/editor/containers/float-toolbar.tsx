import { defineComponent } from 'vue';
import { createBem } from '../../../utils';

export default defineComponent({
  name: 'CoEditorFloatToolbar',
  setup(_, { slots }) {
    const bem = createBem('editor-float-toolbar');
    return () => {
      return <div class={[bem.b()]}>{slots.default?.()}</div>;
    };
  },
});
