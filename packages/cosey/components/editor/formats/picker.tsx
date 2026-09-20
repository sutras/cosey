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
    /**
     * 关闭时立即隐藏、不做淡出过渡。表格网格选择器锚定在上下文菜单项上，
     * 选完格子后菜单会随之关闭，菜单项 display:none 会让弹窗的 reference 丢失、
     * 被 popper 重新定位到左上角。此刻若还停留在淡出过程中，就会出现
     * 「先跳到左上角再消失」的闪动。立即隐藏可避开这段过渡。
     */
    noTransition: { type: Boolean },
  },
  emits: {
    'update:visible': (visible: boolean) => isBoolean(visible),
  },
  slots: Object as SlotsType<{
    default: {};
    content: {};
  }>,
  setup(props, { slots, emit, expose }) {
    const bem = createBem('editor-picker');

    const contentRef = useTemplateRef<HTMLElement>('content');

    const contextTriggerTarget = ref<HTMLElement>();

    provide(pickerContextKey, {
      triggerTarget: contextTriggerTarget,
    });

    const mergedTriggerTarget = computed(() => {
      return props.triggerTarget || contextTriggerTarget.value;
    });

    /**
     * 同步隐藏 popper（不等 Vue 渲染更新）。
     * 表格网格选择器锚定在上下文菜单项上，选完格子后菜单随即关闭、菜单项
     * display:none，popper 检测到 reference 丢失会把弹窗重新定位到左上角。
     * 若等 Vue 更新再隐藏，中间有 1~2 帧窗口期，弹窗会先闪到左上角再消失。
     * 在关闭菜单之前同步把 popper 置为 display:none，即可跳过这段闪动。
     */
    const hide = () => {
      const popper = contentRef.value?.closest('.el-popper');
      if (popper instanceof HTMLElement) {
        popper.style.display = 'none';
      }
      emit('update:visible', false);
    };

    expose({ hide });

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
          transition={props.noTransition ? 'co-editor-picker-instant' : undefined}
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
