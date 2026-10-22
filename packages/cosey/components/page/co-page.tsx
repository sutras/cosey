import { computed, defineComponent, getCurrentInstance } from 'vue';
import type { Router } from 'vue-router';
import { ElButton } from 'element-plus';
import { RtiChevronLeft } from 'richtext-icons';
import { coPageProps, coPageSlots, coPageEmits } from './co-page.api';
import { Icon } from '../icon';
import { useLocale } from '../../hooks';
import { createBem } from '../../utils';

export default defineComponent({
  name: 'CoPage',
  props: coPageProps,
  slots: coPageSlots,
  emits: coPageEmits,
  setup(props, { slots, emit }) {
    const { t } = useLocale();

    const bem = createBem('page');

    const router = getCurrentInstance()?.appContext.config.globalProperties.$router as
      | Router
      | undefined;

    const hasHeader = computed(
      () =>
        !!(
          props.title ||
          props.description ||
          slots.title ||
          slots.description ||
          slots.actions ||
          slots.extra ||
          props.back
        ),
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

    return () => (
      <div class={[bem.b(), bem.is('ghost', props.ghost)]}>
        {hasHeader.value && (
          <div class={[bem.e('header'), bem.is('border', props.border)]}>
            <div class={bem.e('heading')}>
              {props.back ? (
                <ElButton
                  class={bem.e('back')}
                  link
                  onClick={onBack}
                  aria-label={t('co.common.back')}
                >
                  <Icon size="lg">
                    <RtiChevronLeft />
                  </Icon>
                </ElButton>
              ) : null}
              <div class={bem.e('titles')}>
                <div class={bem.e('title')}>{slots.title?.({}) ?? props.title}</div>
                {slots.description || props.description ? (
                  <div class={bem.e('description')}>
                    {slots.description?.({}) ?? props.description}
                  </div>
                ) : null}
              </div>
            </div>
            {slots.actions ? <div class={bem.e('actions')}>{slots.actions({})}</div> : null}
            {slots.extra ? <div class={bem.e('extra')}>{slots.extra({})}</div> : null}
          </div>
        )}

        <div class={bem.e('body')}>{slots.default?.({})}</div>

        {slots.footer ? <div class={bem.e('footer')}>{slots.footer({})}</div> : null}
      </div>
    );
  },
});
