import { defineComponent } from 'vue';
import { createBem } from '../../utils';

export default defineComponent({
  name: 'CoEditorButtonGroup',
  props: {
    duo: Boolean,
    wrap: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { slots }) {
    const bem = createBem('editor-button');
    return () => {
      return (
        <div class={[bem.e('group'), bem.is('duo', props.duo), bem.is('wrap', props.wrap)]}>
          {slots.default?.()}
        </div>
      );
    };
  },
});
