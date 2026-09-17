import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  PropType,
  provide,
  ref,
  SlotsType,
  useTemplateRef,
} from 'vue';
import { ElTooltip } from 'element-plus';
import { createBem, isBoolean } from '../../../utils';
import { pickerContextKey } from './picker.api';

export default defineComponent({
  name: 'CoEditorPicker',
  props: {
    popperClass: { type: null },
    visible: { type: Boolean },
    maxHeight: { type: String },
    triggerTarget: { type: [Object, null] as PropType<HTMLElement | null> },
    nopadding: { type: Boolean },
  },
  emits: {
    'update:visible': (visible: boolean) => isBoolean(visible),
  },
  slots: Object as SlotsType<{
    default: {};
    content: {};
  }>,
  setup(props, { slots, emit }) {
    const bem = createBem('editor-picker');

    const contentRef = useTemplateRef<HTMLElement>('content');

    const contextTriggerTarget = ref<HTMLElement>();

    provide(pickerContextKey, {
      triggerTarget: contextTriggerTarget,
    });

    const mergedTriggerTarget = computed(() => {
      return props.triggerTarget || contextTriggerTarget.value;
    });

    const onDocClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        !props.visible ||
        (mergedTriggerTarget.value && mergedTriggerTarget.value.contains(target)) ||
        contentRef.value?.contains(target)
      ) {
        return;
      }

      emit('update:visible', false);
    };

    onMounted(() => {
      document.addEventListener('click', onDocClick, false);
    });

    onBeforeUnmount(() => {
      document.removeEventListener('click', onDocClick, false);
    });

    return () => {
      return (
        <ElTooltip
          visible={props.visible}
          showArrow={false}
          placement="bottom-start"
          offset={0}
          gpuAcceleration={false}
          popperClass={[bem.b(), props.popperClass]}
          stopPopperMouseEvent={false}
          effect="light"
          trigger="click"
          persistent
          v-slots={{
            default: slots.default,
            content: () => (
              <div
                ref="content"
                class={[bem.e('content'), bem.is('nopadding', props.nopadding)]}
                style={{ maxHeight: props.maxHeight }}
                onMousedown={(event) => {
                  const target = event.target as HTMLElement;

                  // 允许输入类元素获得焦点，避免阻止其默认聚焦行为
                  if (target.closest('input, textarea, [contenteditable="true"]')) {
                    return;
                  }

                  event.preventDefault();
                }}
              >
                {slots.content?.({})}
              </div>
            ),
          }}
        />
      );
    };
  },
});
