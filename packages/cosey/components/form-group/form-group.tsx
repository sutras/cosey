import { computed, defineComponent, ref, watch } from 'vue';
import { formGroupEmits, formGroupProps, formGroupSlots } from './form-group.api';
import { reactiveOmit } from '@vueuse/core';
import { Icon } from '../icon';
import { ElTooltip } from 'element-plus';
import { createBem } from '../../utils';
import { locateInvalidContainer, useInvalidResponse } from '../form';
import { RtiCaretDown, RtiCaretUp, RtiHelp } from 'richtext-icons';

export default defineComponent({
  name: 'CoFormGroup',
  props: formGroupProps,
  slots: formGroupSlots,
  emits: formGroupEmits,
  setup(props, { slots, emit }) {
    const bem = createBem('form-group');

    const spaceProps = reactiveOmit(props, [
      'title',
      'tooltip',
      'borderStyle',
      'position',
      'collapsible',
      'collapsed',
      'switchToInvalid',
    ]);

    const rootRef = ref<HTMLElement>();

    const innerCollapsed = ref(false);

    const isBordered = computed(() => !!(props.title || slots.title));

    watch(
      () => props.collapsed,
      () => {
        innerCollapsed.value = !!props.collapsed;
      },
      {
        immediate: true,
      },
    );

    const handleToggle = () => {
      if (props.collapsible) {
        innerCollapsed.value = !innerCollapsed.value;
        emit('update:collapsed', innerCollapsed.value);
      }
    };

    // 收起状态下出错字段是 display:none，红字完全看不见 —— 校验失败时自动展开
    useInvalidResponse(({ invalidFields, fields }) => {
      if (!props.switchToInvalid || !innerCollapsed.value) {
        return;
      }

      const isInvalid = locateInvalidContainer(invalidFields, fields, [
        {
          value: true,
          getEl: () => rootRef.value,
        },
      ]);

      if (isInvalid) {
        innerCollapsed.value = false;
        emit('update:collapsed', false);
      }
    });

    return () => {
      return (
        <div
          ref={rootRef}
          class={[
            bem.b(),
            bem.is('bordered', isBordered.value),
            bem.is('collapsed', innerCollapsed.value),
          ]}
          style={{
            borderStyle: isBordered.value ? props.borderStyle : undefined,
          }}
        >
          {(props.title || slots.title) && (
            <div class={[bem.e('title'), bem.is(props.position)]}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  cursor: props.collapsible ? 'pointer' : '',
                }}
                onClick={handleToggle}
              >
                {props.collapsible && (
                  <Icon size="xl">{innerCollapsed.value ? <RtiCaretUp /> : <RtiCaretDown />}</Icon>
                )}
                {props.title || slots.title?.()}
                {(props.tooltip || slots.tooltip) && (
                  <ElTooltip
                    placement="top"
                    v-slots={{
                      content: () => props.tooltip || slots.tooltip?.(),
                      default: () => (
                        <Icon class={bem.e('title-icon')} size="md">
                          <RtiHelp />
                        </Icon>
                      ),
                    }}
                  />
                )}
              </div>
            </div>
          )}

          <el-space v-show={!innerCollapsed.value} {...spaceProps} class={bem.e('space')}>
            {slots.default?.({})}
          </el-space>
        </div>
      );
    };
  },
});
