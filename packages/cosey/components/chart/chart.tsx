import { computed, defineComponent, ref, watch } from 'vue';
import { ElButton, ElEmpty, ElSkeleton } from 'element-plus';
import { chartProps, chartSlots, chartEmits } from './chart.api';
import { Icon } from '../icon';
import { useEcharts, useLocale } from '../../hooks';
import { addPxUnit, createBem } from '../../utils';
import { RtiDownload } from 'richtext-icons';

export default defineComponent({
  name: 'CoChart',
  props: chartProps,
  slots: chartSlots,
  emits: chartEmits,
  setup(props, { slots, emit }) {
    const { t } = useLocale();

    const bem = createBem('chart');

    const elRef = ref<HTMLElement | null>(null);

    const { chart, setOption } = useEcharts(elRef, {
      option: props.option,
    });

    // option 变化时重设（与 useEcharts 内部 watch 互补：这里带上 notMerge）
    watch(
      () => props.option,
      (option) => {
        if (option) {
          setOption(option, !props.merge);
        }
      },
    );

    // echarts 自带 loading
    watch(
      () => [props.loading, chart.value] as const,
      ([loading, instance]) => {
        if (!instance) {
          return;
        }

        if (loading) {
          instance.showLoading('default', {
            text: props.loadingText ?? t('co.common.loading'),
            color: getComputedStyle(document.documentElement).getPropertyValue(
              '--el-color-primary',
            ),
            maskColor: 'transparent',
          });
        } else {
          instance.hideLoading();
        }
      },
      { immediate: true },
    );

    const exportImage = () => {
      const instance = chart.value;

      if (!instance) {
        return;
      }

      const url = instance.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: props.backgroundColor,
      });

      emit('export', url);

      // false 表示「只给 URL，不落盘」；其余情况一律下载，避免点了没反应
      if (props.exportFilename === false || !url) {
        return;
      }

      const link = document.createElement('a');

      link.href = url;
      link.download = props.exportFilename || 'chart.png';
      link.rel = 'noopener';

      // Safari 只对已入文档的 <a> 响应 click()
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const isEmpty = computed(() => !!props.empty);

    // Vue 不会给数字自动补单位，直接写 `style={{ height: 300 }}` 会被浏览器丢掉
    const rootStyle = computed(() => ({ height: addPxUnit(props.height) }));

    return () => (
      <div class={[bem.b(), bem.is('toolbar', props.toolbar)]} style={rootStyle.value}>
        {props.toolbar ? (
          <div class={bem.e('toolbar')}>
            <ElButton link onClick={exportImage} aria-label={t('co.chart.exportImage')}>
              <Icon size="lg">
                <RtiDownload />
              </Icon>
            </ElButton>
          </div>
        ) : null}

        {props.loading && props.skeleton ? (
          <ElSkeleton rows={6} animated />
        ) : isEmpty.value ? (
          <ElEmpty description={props.emptyText ?? t('co.common.noData')} />
        ) : (
          <>
            <div ref={elRef} class={bem.e('canvas')}></div>
            {slots.default?.({ chart: chart.value, exportImage })}
          </>
        )}
      </div>
    );
  },
});
