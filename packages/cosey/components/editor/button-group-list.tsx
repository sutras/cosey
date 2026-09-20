import { defineComponent } from 'vue';
import { createBem } from '../../utils';

export default defineComponent({
  name: 'CoEditorButtonGroupList',
  props: {
    wrap: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { slots }) {
    const bem = createBem('editor-button');
    return () => {
      return (
        <div class={[bem.e('group-list'), bem.is('wrap', props.wrap)]}>{slots.default?.()}</div>
      );
    };
  },
});
