import { defineComponent, inject, onMounted, useTemplateRef } from 'vue';
import { createBem } from '../../utils';
import { pickerContextKey } from './formats/picker.api';
import Button, { type EditorButtonExpose } from './button';
import { Icon } from '../icon';
import { RtiChevronDown } from 'richtext-icons';

export default defineComponent({
  name: 'CoEditorButtonSplit',
  props: {
    chevronActive: { type: Boolean },
    active: { type: Boolean },
  },
  emits: {
    click: (event: MouseEvent) => event instanceof MouseEvent,
    'chevron-click': (event: MouseEvent) => event instanceof MouseEvent,
  },
  setup(props, { slots, emit }) {
    const bem = createBem('editor-button');

    const onBtnClick = (event: MouseEvent) => {
      emit('click', event);
    };

    const onChevronClick = (event: MouseEvent) => {
      emit('chevron-click', event);
    };

    const chevronButtonRef = useTemplateRef<EditorButtonExpose>('chevronButton');

    const pickerContext = inject(pickerContextKey, null);

    onMounted(() => {
      if (pickerContext) {
        pickerContext.triggerTarget.value = chevronButtonRef.value!.el as HTMLElement;
      }
    });

    return () => {
      return (
        <div class={[bem.e('split'), bem.is('active', props.chevronActive)]}>
          <Button active={props.active} {...{ onClick: onBtnClick }}>
            {slots.default?.()}
          </Button>
          <Button
            ref="chevronButton"
            active={props.chevronActive}
            class={bem.e('chevron')}
            onClick={onChevronClick}
          >
            <Icon class={bem.e('arrow')} size="lg">
              <RtiChevronDown />
            </Icon>
          </Button>
        </div>
      );
    };
  },
});
