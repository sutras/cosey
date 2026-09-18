import { computed, defineComponent, Transition } from 'vue';
import { ElButton, ElProgress } from 'element-plus';
import { type UploadFileStatus, uploadItemProps, uploadItemEmits } from './upload.api';
import { isString, createBem } from '../../utils';
import { MediaCard } from '../media-card';
import { Icon } from '../icon';
import { useLocale } from '../../hooks';
import { RtiClose, RtiCloseFilled } from 'richtext-icons';

export default defineComponent({
  name: 'CoUploadItem',
  props: uploadItemProps,
  emits: uploadItemEmits,
  setup(props, { emit }) {
    const bem = createBem('upload');

    const { t } = useLocale();

    const progressStatus = {
      success: 'success',
      error: 'exception',
    } as const;

    const getProgressStatus = (status: UploadFileStatus) => {
      return progressStatus[status as keyof typeof progressStatus];
    };

    const progressFormat = (percentage: number) => {
      return Math.floor(percentage) + '%';
    };

    const showRemove = computed(
      () => !props.readonly && (props.file.status === 'unready' || props.file.status === 'success'),
    );

    const mergedTitle = computed(() => (isString(props.file.url) ? props.file.url : ''));

    const progressSize = computed(() => {
      return {
        mini: 48,
        small: 48,
        middle: 48,
        large: 64,
      }[props.size];
    });

    const isSmall = computed(() => props.size === 'mini' || props.size === 'small');

    return () => {
      return (
        <div class={[bem.e('item'), bem.is(props.size)]}>
          <MediaCard
            ref="media"
            src={props.file.previewUrl}
            name={props.file.name}
            type={props.file.type}
            size={props.size}
            title={mergedTitle.value}
          />
          <Transition name="co-fade">
            {(props.file.status === 'loading' || props.file.status === 'error') && (
              <div class={bem.e('status')}>
                {isSmall.value && (
                  <div class={bem.e('progress-plain')}>
                    <span class={bem.e('progress-text')}>{progressFormat(props.file.percent)}</span>
                  </div>
                )}
                {!isSmall.value && (
                  <ElProgress
                    percentage={props.file.percent}
                    type="circle"
                    width={progressSize.value}
                    status={getProgressStatus(props.file.status)}
                  >
                    {({ percentage }: any) => {
                      return props.file.status === 'error' ? (
                        <Icon size="lg">
                          <RtiCloseFilled />
                        </Icon>
                      ) : (
                        <span class={bem.e('progress-text')}>{progressFormat(percentage)}</span>
                      );
                    }}
                  </ElProgress>
                )}

                <div class={bem.e('actions')}>
                  {props.file.status === 'loading' && (
                    <ElButton
                      link
                      size="small"
                      type="primary"
                      style={{ margin: 0, padding: 0 }}
                      onClick={() => emit('cancel')}
                    >
                      {t('co.upload.cancelUpload')}
                    </ElButton>
                  )}
                  {props.file.status === 'error' && (
                    <ElButton
                      link
                      size="small"
                      type="primary"
                      style={{ margin: 0, padding: 0 }}
                      onClick={() => emit('re-upload')}
                    >
                      {t('co.upload.reUpload')}
                    </ElButton>
                  )}
                  <ElButton
                    link
                    size="small"
                    type="primary"
                    style={{ margin: 0, padding: 0 }}
                    onClick={() => emit('remove')}
                  >
                    {t('co.common.delete')}
                  </ElButton>
                </div>
              </div>
            )}
          </Transition>
          {showRemove.value && (
            <div class={bem.e('remove')} onClick={() => emit('remove')}>
              <Icon size="md">
                <RtiClose />
              </Icon>
            </div>
          )}
        </div>
      );
    };
  },
});
