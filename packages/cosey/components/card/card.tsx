import { computed, defineComponent, useModel, type CSSProperties } from 'vue';
import { ElCollapseTransition, ElTooltip } from 'element-plus';
import { RtiChevronDown } from 'richtext-icons';
import { cardEmits, cardProps, cardSlots } from './card.api';
import { Icon } from '../icon';
import { createBem } from '../../utils';

export default defineComponent({
  name: 'CoCard',
  props: cardProps,
  slots: cardSlots,
  emits: cardEmits,
  setup(props, { slots, emit }) {
    const bem = createBem('card');

    const collapsed = useModel(props, 'collapsed');

    const hasHeader = computed(
      () =>
        !!(
          props.title ||
          props.subTitle ||
          props.tooltip ||
          slots.title ||
          slots.subTitle ||
          slots.extra
        ),
    );

    const showToggle = computed(() => !!props.collapsible && hasHeader.value);

    const toggle = (event?: MouseEvent) => {
      // header 模式下图标也在标题区内，不拦冒泡会切换两次
      event?.stopPropagation();

      if (showToggle.value) {
        collapsed.value = !collapsed.value;
      }
    };

    const toSize = (value: string | number) => (typeof value === 'number' ? `${value}px` : value);

    const scrollable = computed(() => props.height !== undefined || props.maxHeight !== undefined);

    const bodyStyle = computed<CSSProperties>(() => {
      const style: CSSProperties = {};

      if (props.height !== undefined) {
        style.height = toSize(props.height);
      }

      if (props.maxHeight !== undefined) {
        style.maxHeight = toSize(props.maxHeight);
      }

      return style;
    });

    const onHeaderClick = () => {
      if (props.collapsible === 'header') {
        toggle();
      }
    };

    const renderHeader = () => {
      return (
        <div
          class={[bem.e('header'), bem.is('clickable', props.collapsible === 'header')]}
          onClick={onHeaderClick}
        >
          <div class={bem.e('heading')}>
            <div class={bem.e('title')}>
              {slots.title ? (
                slots.title({})
              ) : props.title ? (
                <span class={bem.e('title-text')}>{props.title}</span>
              ) : null}
              {props.tooltip ? (
                <ElTooltip content={props.tooltip} placement="top">
                  <Icon class={bem.e('tooltip')} name="bi bi-info-circle" />
                </ElTooltip>
              ) : null}
            </div>

            {slots.subTitle || props.subTitle ? (
              <div class={bem.e('subtitle')}>{slots.subTitle?.({}) ?? props.subTitle}</div>
            ) : null}
          </div>

          {slots.extra ? <div class={bem.e('extra')}>{slots.extra({})}</div> : null}

          {showToggle.value ? (
            <span class={[bem.e('toggle'), bem.is('collapsed', collapsed.value)]} onClick={toggle}>
              <Icon>
                <RtiChevronDown />
              </Icon>
            </span>
          ) : null}
        </div>
      );
    };

    return () => {
      return (
        <div
          class={[
            bem.b(),
            bem.m(props.size),
            bem.m(props.variant),
            bem.m(props.type, !!props.type),
            bem.is('hoverable', props.hoverable),
            bem.is('shadow', props.boxShadow),
            bem.is('collapsible', showToggle.value),
            bem.is('collapsed', collapsed.value),
          ]}
          onClick={(event: MouseEvent) => emit('click', event)}
        >
          {hasHeader.value ? renderHeader() : null}

          <ElCollapseTransition>
            {/* 过渡会改写被包裹元素的 max-height，包一层外壳把动画与 body 的 height 隔离 */}
            <div v-show={!collapsed.value} class={bem.e('wrapper')}>
              <div
                class={[bem.e('body'), bem.is('scrollable', scrollable.value)]}
                style={bodyStyle.value}
              >
                {slots.default?.({})}
              </div>
            </div>
          </ElCollapseTransition>
        </div>
      );
    };
  },
});
