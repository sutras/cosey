import { computed, defineComponent, onBeforeUnmount, ref, unref, watch } from 'vue';
import { ElButton, ElEmpty, ElResult, ElSkeleton } from 'element-plus';
import { asyncProps, asyncSlots, asyncEmits } from './async.api';
import { useLocale } from '../../hooks';
import { createBem } from '../../utils';

export default defineComponent({
  name: 'CoAsync',
  props: asyncProps,
  slots: asyncSlots,
  emits: asyncEmits,
  setup(props, { slots, emit }) {
    const { t } = useLocale();

    const bem = createBem('async');

    const isLoading = computed(() => {
      if (props.loading !== undefined) {
        return props.loading;
      }

      const state = props.state;

      return !!(unref(state?.isFetching) ?? unref(state?.loading));
    });

    const error = computed(() => {
      if (props.error !== undefined) {
        return props.error;
      }

      return unref(props.state?.error);
    });

    const data = computed(() => unref(props.state?.data));

    const isEmpty = computed(() => {
      if (props.empty !== undefined) {
        return props.empty;
      }

      const value = data.value;

      if (Array.isArray(value) || typeof value === 'string') {
        return value.length === 0;
      }

      return false;
    });

    // 延迟显示加载态，避免请求很快时闪一下
    const showLoading = ref(false);

    let timer: ReturnType<typeof setTimeout> | undefined;

    const clearTimer = () => {
      if (timer) {
        clearTimeout(timer);
        timer = undefined;
      }
    };

    watch(
      isLoading,
      (value) => {
        clearTimer();

        if (!value) {
          showLoading.value = false;
          return;
        }

        if (props.delay > 0) {
          timer = setTimeout(() => {
            showLoading.value = true;
          }, props.delay);
        } else {
          showLoading.value = true;
        }
      },
      { immediate: true },
    );

    onBeforeUnmount(clearTimer);

    const retry = () => {
      emit('retry');

      if (props.retry) {
        props.retry();
        return;
      }

      props.state?.execute?.();
    };

    const renderSkeleton = () => {
      if (props.skeleton === false) {
        return null;
      }

      return (
        <ElSkeleton
          class={bem.e('skeleton')}
          rows={props.skeleton === true ? 4 : props.skeleton}
          animated
        />
      );
    };

    return () => {
      if (showLoading.value) {
        return (
          <div class={[bem.b(), bem.is('loading')]}>
            {slots.loading?.({ retry }) ?? renderSkeleton()}
          </div>
        );
      }

      if (error.value !== undefined && error.value !== null && error.value !== false) {
        return (
          <div class={[bem.b(), bem.is('error')]}>
            {slots.error?.({ error: error.value, retry }) ?? (
              <ElResult icon="error" title={String(error.value)}>
                {{
                  extra: () => (
                    <ElButton type="primary" onClick={retry}>
                      {props.retryText ?? t('co.common.reload')}
                    </ElButton>
                  ),
                }}
              </ElResult>
            )}
          </div>
        );
      }

      if (isEmpty.value) {
        return (
          <div class={[bem.b(), bem.is('empty')]}>
            {slots.empty?.({ retry }) ?? (
              <ElEmpty description={props.emptyText ?? t('co.common.noData')} />
            )}
          </div>
        );
      }

      return (
        <div class={bem.b()}>
          {slots.default?.({
            data: data.value,
            loading: showLoading.value,
            error: error.value,
            isEmpty: isEmpty.value,
            retry,
          })}
        </div>
      );
    };
  },
});
