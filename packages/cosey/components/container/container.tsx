import { computed, defineComponent, getCurrentInstance, inject, type CSSProperties } from 'vue';
import { routerKey, type Router } from 'vue-router';
import { ElButton, ElSkeleton, ElSkeletonItem } from 'element-plus';
import { RtiChevronLeft } from 'richtext-icons';
import { containerEmits, containerProps, containerSlots, useContainer } from './container.api';
import { Icon } from '../icon';
import { useLocale } from '../../hooks';
import { createBem } from '../../utils';

const paddingPresets = ['sm', 'md', 'lg'] as const;

export default defineComponent({
  name: 'CoContainer',
  props: containerProps,
  slots: containerSlots,
  emits: containerEmits,
  setup(props, { slots, emit }) {
    const bem = createBem('container');

    const { t } = useLocale();

    const context = useContainer();

    const router =
      inject(routerKey, null) ??
      (getCurrentInstance()?.appContext.config.globalProperties.$router as Router | undefined);

    const paddingModifier = computed(() => {
      const { padding } = props;

      if (padding === false || padding === 0) {
        return 'none';
      }

      if (typeof padding === 'string' && paddingPresets.includes(padding)) {
        return padding;
      }

      return '';
    });

    const hasHeader = computed(
      () =>
        !!(
          props.loading ||
          props.title ||
          props.description ||
          slots.title ||
          slots.description ||
          slots.actions ||
          slots.extra ||
          props.back
        ),
    );

    const hasDescription = computed(() => !!(slots.description || props.description));

    const framed = computed(() => hasHeader.value || !!slots.footer);

    const stickyTop = computed(() => {
      if (props.sticky === false) {
        return undefined;
      }

      if (typeof props.sticky === 'number') {
        return props.sticky;
      }

      return context?.headerHeight ?? 0;
    });

    const rootStyle = computed(() => {
      const style: CSSProperties & Record<string, string> = {};

      if (props.fullPage) {
        style.height = context?.height || '100vh';
      } else if (props.fill) {
        style.height = '100%';
      }

      if (typeof props.padding === 'number' && props.padding > 0) {
        style['--co-container-padding'] = `${props.padding}px`;
      }

      if (props.maxWidth != null) {
        style.maxWidth =
          typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth;
        style.marginInline = 'auto';
      }

      return style;
    });

    const headerStyle = computed(() =>
      stickyTop.value === undefined ? undefined : { top: `${stickyTop.value}px` },
    );

    const onBack = () => {
      emit('back');

      if (typeof props.back === 'function') {
        props.back();
        return;
      }

      if (typeof props.back === 'string') {
        router?.push(props.back as any);
        return;
      }

      if (router && window.history.state?.back) {
        router.back();
        return;
      }

      router?.push('/');
    };

    const bar = (width: number, height: number, marginTop = 0) => (
      <ElSkeletonItem
        variant="text"
        style={{
          display: 'block',
          width: `${width}px`,
          height: `${height}px`,
          marginBlockStart: marginTop ? `${marginTop}px` : undefined,
        }}
      />
    );

    const renderTitles = () => {
      if (props.loading) {
        return (
          <ElSkeleton
            animated
            v-slots={{
              template: () =>
                hasDescription.value ? [bar(180, 22), bar(280, 14, 8)] : [bar(180, 22)],
            }}
          />
        );
      }

      return [
        <div class={bem.e('title')} role="heading" aria-level={props.headingLevel}>
          {slots.title?.({}) ?? props.title}
        </div>,
        hasDescription.value ? (
          <div class={bem.e('description')}>{slots.description?.({}) ?? props.description}</div>
        ) : null,
      ];
    };

    const renderHeader = () => (
      <div class={[bem.e('header'), bem.is('border', props.border)]} style={headerStyle.value}>
        <div class={bem.e('heading')}>
          {props.back ? (
            <ElButton class={bem.e('back')} link onClick={onBack} aria-label={t('co.common.back')}>
              <Icon size="lg">
                <RtiChevronLeft />
              </Icon>
            </ElButton>
          ) : null}

          <div class={bem.e('titles')}>{renderTitles()}</div>
        </div>

        {slots.actions ? <div class={bem.e('actions')}>{slots.actions({})}</div> : null}
        {slots.extra ? <div class={bem.e('extra')}>{slots.extra({})}</div> : null}
      </div>
    );

    return () => {
      const content = slots.default?.({});

      return (
        <div
          class={[
            bem.b(),
            bem.m(`padding-${paddingModifier.value}`, paddingModifier.value),
            bem.is('full-page', props.fullPage),
            bem.is('fill', props.fill),
            bem.is('scrollable', props.scrollable),
            bem.is('mobile-adaptive', props.mobileAdaptive),
            bem.is('short-adaptive', props.shortAdaptive),
            bem.is('framed', framed.value),
            bem.is('sticky', stickyTop.value !== undefined && hasHeader.value),
          ]}
          style={rootStyle.value}
        >
          {hasHeader.value ? renderHeader() : null}
          {framed.value ? <div class={bem.e('body')}>{content}</div> : content}
          {slots.footer ? <div class={bem.e('footer')}>{slots.footer({})}</div> : null}
        </div>
      );
    };
  },
});
