import { defineComponent, inject, onMounted, useTemplateRef } from 'vue';
import { createBem } from '../../utils';
import { pickerContextKey } from './formats/picker.api';

export interface EditorButtonExpose {
  el?: HTMLButtonElement;
}

export default defineComponent({
  name: 'CoEditorButton',
  props: {
    active: { type: Boolean },
    disabled: { type: Boolean },
    title: { type: String },
    /**
     * 作为外层 Picker 的触发器时打开：把自身元素登记给它。
     * 否则 Picker 会把这个触发器的点击当成「点到弹层外面」，刚打开就自己关掉。
     */
    pickerTrigger: { type: Boolean },
  },
  emits: {
    click: (event: MouseEvent) => event instanceof MouseEvent,
  },
  setup(props, { slots, emit, expose }) {
    const bem = createBem('editor-button');

    const buttonRef = useTemplateRef('button');

    const pickerContext = inject(pickerContextKey, null);

    onMounted(() => {
      if (props.pickerTrigger && pickerContext && buttonRef.value) {
        pickerContext.triggerTarget.value = buttonRef.value as HTMLElement;
      }
    });

    expose({
      el: buttonRef,
    });

    return () => {
      return (
        <button
          ref="button"
          type="button"
          title={props.title}
          disabled={props.disabled}
          class={[bem.b(), bem.is('active', props.active), bem.is('disabled', props.disabled)]}
          onClick={(event) => emit('click', event)}
          onMousedown={(event) => event.preventDefault()}
        >
          {slots.default?.()}
        </button>
      );
    };
  },
});
