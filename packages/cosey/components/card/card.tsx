import { computed, defineComponent, nextTick, onBeforeUnmount, ref, useModel, watch } from 'vue';
import { ElTooltip } from 'element-plus';
import { RtiChevronDown } from 'richtext-icons';
import { cardEmits, cardProps, cardSlots } from './card.api';
import { Icon } from '../icon';
import { createBem, cssVarName, warningOnce } from '../../utils';

export default defineComponent({
  name: 'CoCard',
  props: cardProps,
  slots: cardSlots,
  emits: cardEmits,
  setup(props, { slots, emit, attrs }) {
    const bem = createBem('card');

    // 老版本的 height / maxHeight 已移除：现在限高交给根元素（`style="max-height: 320px"`，
    // 或由父级 flex 决定），内容区会自己滚动。留着它们是静默失效，开发期直接点名。
    warningOnce(
      !('height' in attrs || 'maxHeight' in attrs || 'max-height' in attrs),
      '[co-card] height / maxHeight 已移除，改用 style="max-height: 320px" 限高（内容区会内部滚动）',
    );

    const collapsed = useModel(props, 'collapsed');

    const hasHeader = computed(
      () =>
        !!(
          slots.header ||
          props.title ||
          props.subTitle ||
          props.tooltip ||
          slots.title ||
          slots.subTitle ||
          slots.extra
        ),
    );

    const showToggle = computed(() => !!props.collapsible && hasHeader.value);

    const hasFooter = computed(() => !!(props.footer || slots.footer));

    // 折叠自己实现：`ElCollapseTransition` 会往被包裹元素上写死内联高度，
    // 与 body 的 `flex: 1` / `overflow: auto` 抢同一份尺寸，展开后还可能残留一帧高度。
    const bodyEl = ref<HTMLElement>();

    /** 只描述「body 是否隐藏」，落地上还要和动画配合 */
    const bodyHidden = ref(collapsed.value);

    let animation: Animation | undefined;

    const readDuration = (el: HTMLElement) => {
      const raw = getComputedStyle(el).getPropertyValue(cssVarName('transition-duration')).trim();
      const value = parseFloat(raw);

      if (!value) {
        return 300;
      }

      return raw.endsWith('ms') ? value : value * 1000;
    };

    /** 等这次动画跑完；被下一次折叠顶掉时返回 false */
    const settle = async (instance: Animation) => {
      try {
        await instance.finished;
      } catch {
        return false;
      }

      return animation === instance;
    };

    /** 动画期间取消 flex 分配与滚动条，否则固定高度的卡片里 body 会被 flex 撑回去 */
    const lock = (el: HTMLElement) => {
      el.style.flex = 'none';
      el.style.overflow = 'hidden';
    };

    const unlock = (el: HTMLElement) => {
      el.style.height = '';
      el.style.flex = '';
      el.style.overflow = '';
    };

    const animateBody = async (toCollapsed: boolean) => {
      const el = bodyEl.value;

      if (!el) {
        bodyHidden.value = toCollapsed;
        return;
      }

      animation?.cancel();
      // 上一次动画可能被中途取消，留下 `flex: none`；量高度之前先回到静止状态
      unlock(el);

      const duration = readDuration(el);

      if (toCollapsed) {
        // border-box 下 `height: 0` 仍会留下内边距的高度，必须一起收
        const style = getComputedStyle(el);

        const instance = el.animate(
          {
            height: [`${el.getBoundingClientRect().height}px`, '0px'],
            paddingBlockStart: [style.paddingBlockStart, '0px'],
            paddingBlockEnd: [style.paddingBlockEnd, '0px'],
          },
          { duration, easing: 'ease-in-out', fill: 'both' },
        );

        lock(el);
        animation = instance;

        if (!(await settle(instance))) {
          return;
        }

        // 先藏再取消，免得回到自然高度时闪一帧
        el.style.display = 'none';
        instance.cancel();
        unlock(el);
        animation = undefined;
        bodyHidden.value = true;

        return;
      }

      bodyHidden.value = false;
      await nextTick();

      // 先让布局给出静止时的高度（flex 分配之后），从这个值动画过去就不会在结束时跳一下
      const style = getComputedStyle(el);
      const instance = el.animate(
        {
          height: ['0px', `${el.getBoundingClientRect().height}px`],
          paddingBlockStart: ['0px', style.paddingBlockStart],
          paddingBlockEnd: ['0px', style.paddingBlockEnd],
        },
        { duration, easing: 'ease-in-out', fill: 'both' },
      );

      lock(el);
      animation = instance;

      if (!(await settle(instance))) {
        return;
      }

      instance.cancel();
      unlock(el);
      animation = undefined;
    };

    watch(collapsed, (value) => animateBody(value), { flush: 'post' });

    onBeforeUnmount(() => animation?.cancel());

    const toggle = (event?: MouseEvent) => {
      // header 模式下图标也在标题区内，不拦冒泡会切换两次
      event?.stopPropagation();

      if (showToggle.value) {
        collapsed.value = !collapsed.value;
      }
    };

    const onHeaderClick = () => {
      if (props.collapsible === 'header') {
        toggle();
      }
    };

    const renderHeader = () => {
      return (
        <div
          class={[
            bem.e('header'),
            bem.is('clickable', props.collapsible === 'header'),
            props.headerClass,
          ]}
          style={props.headerStyle}
          onClick={onHeaderClick}
        >
          {slots.header ? (
            slots.header({})
          ) : (
            <>
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
            </>
          )}

          {showToggle.value ? (
            <span
              class={[
                bem.e('toggle'),
                bem.is('collapsed', collapsed.value),
                // 没有操作区时由折叠按钮把剩余空间吃掉，否则它会贴在导航后面
                bem.is('push', !slots.extra),
              ]}
              onClick={toggle}
            >
              <Icon>
                <RtiChevronDown />
              </Icon>
            </span>
          ) : null}
        </div>
      );
    };

    const renderFooter = () => {
      return (
        <div class={[bem.e('footer'), props.footerClass]} style={props.footerStyle}>
          {slots.footer ? slots.footer({}) : props.footer}
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

          <div
            ref={bodyEl}
            class={[bem.e('body'), props.bodyClass]}
            style={[props.bodyStyle, { display: bodyHidden.value ? 'none' : '' }]}
          >
            {slots.default?.({})}
          </div>

          {hasFooter.value ? renderFooter() : null}
        </div>
      );
    };
  },
});
