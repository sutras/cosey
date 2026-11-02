import {
  type CardTabItem,
  type CardTabName,
  type CardTabsContext,
  type CardTabsExpose,
  cardTabsContextSymbol,
  cardTabsEmits,
  cardTabsProps,
  cardTabsSlots,
  isSameTabName,
} from './card-tabs.api';
import {
  Fragment,
  cloneVNode,
  computed,
  defineComponent,
  isVNode,
  nextTick,
  onActivated,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  provide,
  ref,
  useModel,
  watch,
  type VNodeArrayChildren,
} from 'vue';
import { ElTooltip } from 'element-plus';
import { reactiveOmit } from '@vueuse/core';
import { useResizeObserver } from '../../hooks';
import { Card } from '../card';
import { Icon } from '../icon';
import { auid, createBem } from '../../utils';
import CardTabPanel from './card-tab-panel.vue';

export default defineComponent({
  name: 'CoCardTabs',
  props: cardTabsProps,
  slots: cardTabsSlots,
  emits: cardTabsEmits,
  setup(props, { slots, emit, expose }) {
    const bem = createBem('card-tabs');

    // 标题区自己渲染，样式复用卡片的类名，免得两套 CSS 对不齐
    const cardBem = createBem('card');

    const uid = auid('co-card-tabs-');

    const innerValue = useModel(props, 'modelValue');

    const navEl = ref<HTMLElement>();

    const inkEl = ref<HTMLElement>();

    const thumbEl = ref<HTMLElement>();

    /** 首帧只定位、不滑动，否则指示器会从最左侧滑进来 */
    let indicatorPlaced = false;

    let indicatorFrame = 0;

    /**
     * 指示器（下划线 / 分段选中块）是全导航共用的一块，靠 transform 滑到激活页签下方。
     * 直接改 DOM 样式而不是走响应式：这里每次都要量尺寸，重新渲染反而更绕。
     */
    const syncIndicator = () => {
      const scroll = navEl.value;
      const ink = inkEl.value;
      const thumb = thumbEl.value;
      const indicator = ink || thumb;

      if (!scroll || !indicator) {
        return;
      }

      const active = scroll.querySelector<HTMLElement>(`.${bem.e('item')}.is-active`);

      if (!active) {
        indicator.style.opacity = '0';

        return;
      }

      // keep-alive 停用时子树被移出布局，量到的宽度和偏移都是 0。
      // 这时候写下去等于把指示器丢回最左边，重新激活时它就会从左往右滑一遍。
      if (!active.offsetWidth) {
        return;
      }

      // 下划线只占文字宽度（让开页签内边距），分段选中块要盖满整个页签
      let offset = 0;
      let width = active.offsetWidth;

      if (ink) {
        const style = getComputedStyle(active);
        const start = parseFloat(style.paddingInlineStart) || 0;
        const end = parseFloat(style.paddingInlineEnd) || 0;

        offset = start;
        width -= start + end;
      }

      if (!indicatorPlaced) {
        indicator.style.transition = 'none';
      }

      indicator.style.opacity = '1';
      indicator.style.width = `${width}px`;
      indicator.style.transform = `translateX(${active.offsetLeft + offset}px)`;

      if (!indicatorPlaced) {
        // 先让首帧落位生效，再放开过渡
        void indicator.offsetWidth;

        indicator.style.transition = '';
        indicatorPlaced = true;
      }
    };

    /** 同一帧内的多次更新只量一次尺寸 */
    const scheduleIndicator = () => {
      if (indicatorFrame) {
        return;
      }

      indicatorFrame = requestAnimationFrame(() => {
        indicatorFrame = 0;

        syncIndicator();
      });
    };

    onMounted(scheduleIndicator);

    onUpdated(scheduleIndicator);

    onActivated(() => {
      // 从 keep-alive 里回来时直接落位，别让指示器从左边滑一遍
      indicatorPlaced = false;

      scheduleIndicator();
    });

    useResizeObserver(navEl, scheduleIndicator);

    watch(
      () => props.tabType,
      () => {
        // 指示器是切换类型时才挂载的，首帧标记要跟着重置
        indicatorPlaced = false;

        scheduleIndicator();
      },
    );

    onBeforeUnmount(() => {
      cancelAnimationFrame(indicatorFrame);
    });

    const cardOnlyProps = reactiveOmit(props, 'modelValue', 'tabType', 'beforeLeave', 'collapsed');

    // 折叠状态要自己持一份：直接把 `collapsed` 透给卡片会变成受控，
    // 调用方没绑 `v-model:collapsed` 时点箭头就没反应
    const innerCollapsed = useModel(props, 'collapsed');

    /**
     * 布尔属性在 vnode 上是空字符串（`<co-card-tab-panel disabled>` 编译成 `disabled: ''`），
     * 从插槽 vnode 上读的时候不能直接取反。
     */
    const isTruthy = (value: unknown) => value === '' || value === true;

    /**
     * 页签从默认插槽的 vnode 上读：顺序天然等于书写顺序，
     * `label` 也是每次渲染重读，不用再维护一份注册表。
     */
    const items = (): CardTabItem[] => {
      const content = slots.default?.({}) || [];
      const children = (
        content.length === 1 && content[0].type === Fragment
          ? (content[0].children as VNodeArrayChildren)
          : content
      ) as any[];

      const list: CardTabItem[] = [];

      children.forEach((child) => {
        if (!isVNode(child) || child.type !== CardTabPanel) {
          return;
        }

        const index = list.length;
        const panelProps = (child.props || {}) as any;
        const panelSlots = (child.children || {}) as any;

        list.push({
          vnode: child,
          index,
          name: panelProps.name ?? index,
          label: panelProps.label,
          labelSlot: typeof panelSlots.label === 'function' ? panelSlots.label : undefined,
          disabled: isTruthy(panelProps.disabled),
          lazy: isTruthy(panelProps.lazy),
        });
      });

      return list;
    };

    /** 激活的页签被移除时回落到第一个，否则整块内容区会一片空白 */
    const activeName = computed<CardTabName | undefined>(() => {
      const list = items();
      const current = innerValue.value;

      return list.some((item) => isSameTabName(item.name, current)) ? current : list[0]?.name;
    });

    provide<CardTabsContext>(cardTabsContextSymbol, {
      active: () => activeName.value,
      uid,
    });

    const activate = async (name: CardTabName) => {
      const target = items().find((item) => isSameTabName(item.name, name));

      if (!target || target.disabled || isSameTabName(name, activeName.value)) {
        return;
      }

      const oldName = activeName.value;

      if (props.beforeLeave) {
        const result = await props.beforeLeave(name, oldName);

        if (result === false) {
          return;
        }
      }

      innerValue.value = name;
      emit('tabChange', name, oldName);
    };

    const focusItem = (index: number) => {
      nextTick(() => {
        navEl.value?.querySelector<HTMLElement>(`[data-index="${index}"]`)?.focus();
      });
    };

    const onKeydown = (event: KeyboardEvent) => {
      const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];

      if (!keys.includes(event.key)) {
        return;
      }

      const enabled = items().filter((item) => !item.disabled);

      if (!enabled.length) {
        return;
      }

      event.preventDefault();

      const current = enabled.findIndex((item) => isSameTabName(item.name, activeName.value));
      let next = current;

      if (event.key === 'Home') {
        next = 0;
      } else if (event.key === 'End') {
        next = enabled.length - 1;
      } else if (event.key === 'ArrowLeft') {
        next = current <= 0 ? enabled.length - 1 : current - 1;
      } else {
        next = current >= enabled.length - 1 ? 0 : current + 1;
      }

      const target = enabled[next];

      activate(target.name);
      focusItem(target.index);
    };

    const renderNav = () => {
      return (
        <div
          class={bem.e('nav')}
          role="tablist"
          aria-orientation="horizontal"
          onKeydown={onKeydown}
        >
          <div class={bem.e('nav-scroll')} ref={navEl}>
            {items().map((item) => {
              const active = isSameTabName(item.name, activeName.value);

              return (
                <div
                  role="tab"
                  data-index={item.index}
                  id={`${uid}-tab-${item.index}`}
                  aria-selected={active ? 'true' : 'false'}
                  aria-controls={item.lazy ? undefined : `${uid}-panel-${item.index}`}
                  tabindex={active ? 0 : -1}
                  class={[
                    bem.e('item'),
                    bem.is('active', active),
                    bem.is('disabled', item.disabled),
                  ]}
                  onClick={(event: MouseEvent) => {
                    // `collapsible="header"` 时点页签不能顺带把卡片收起来
                    event.stopPropagation();
                    emit('tabClick', item.name);
                    activate(item.name);
                  }}
                >
                  {item.labelSlot ? item.labelSlot() : item.label}
                </div>
              );
            })}

            {props.tabType === 'line' ? <span class={bem.e('ink')} ref={inkEl} /> : null}

            {props.tabType === 'segment' ? <span class={bem.e('thumb')} ref={thumbEl} /> : null}
          </div>
        </div>
      );
    };

    const renderHeader = () => {
      const hasHeading = !!(
        props.title ||
        props.subTitle ||
        props.tooltip ||
        slots.title ||
        slots.subTitle
      );

      return (
        <div class={bem.e('header')}>
          {hasHeading ? (
            <div class={cardBem.e('heading')}>
              <div class={cardBem.e('title')}>
                {slots.title ? (
                  slots.title({})
                ) : props.title ? (
                  <span class={cardBem.e('title-text')}>{props.title}</span>
                ) : null}
                {props.tooltip ? (
                  <ElTooltip content={props.tooltip} placement="top">
                    <Icon class={cardBem.e('tooltip')} name="bi bi-info-circle" />
                  </ElTooltip>
                ) : null}
              </div>

              {slots.subTitle || props.subTitle ? (
                <div class={cardBem.e('subtitle')}>{slots.subTitle?.({}) ?? props.subTitle}</div>
              ) : null}
            </div>
          ) : null}

          {renderNav()}

          {slots.extra ? <div class={cardBem.e('extra')}>{slots.extra({})}</div> : null}
        </div>
      );
    };

    const renderPanels = () => {
      return items().map((item) =>
        cloneVNode(item.vnode, {
          tabName: item.name,
          tabIndex: item.index,
        }),
      );
    };

    expose<CardTabsExpose>({
      get activeName() {
        return activeName.value;
      },
      activate,
      getTabNames: () => items().map((item) => item.name),
    });

    return () => {
      return (
        <Card
          class={[bem.b(), bem.m(props.tabType)]}
          {...cardOnlyProps}
          collapsed={innerCollapsed.value}
          onClick={(event: MouseEvent) => emit('click', event)}
          {...{
            'onUpdate:collapsed': (value: boolean) => {
              innerCollapsed.value = value;
              emit('update:collapsed', value);
            },
          }}
          v-slots={{
            header: renderHeader,
            default: renderPanels,
            footer: slots.footer,
          }}
        />
      );
    };
  },
});
