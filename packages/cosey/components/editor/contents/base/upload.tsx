import { defineComponent, onBeforeUnmount, PropType } from 'vue';
import { ElButton } from 'element-plus';
import { createBem, isString } from '../../../../utils';
import { useLocale, useSingleUpload } from '../../../../hooks';

export default defineComponent({
  name: 'CoEditorUpload',
  props: {
    file: {
      type: Object as PropType<File>,
      required: true,
    },
  },
  emits: {
    success: (url: string) => isString(url),
  },
  setup(props, { emit }) {
    const bem = createBem('editor-upload');
    const { t } = useLocale();

    const { sent, cancel, status, progress } = useSingleUpload(() => props.file, {
      onSuccess(url) {
        emit('success', url);
      },
    });

    const onCancel = () => {
      cancel();
    };

    const onReSend = () => {
      sent();
    };

    onBeforeUnmount(() => {
      cancel();
    });

    sent();

    return () => {
      return (
        <div class={bem.b()}>
          <div class={bem.e('content')}>
            <div class={bem.e('progress')}>{progress.value}%</div>
            {status.value === 'senting' && (
              <ElButton link type="primary" onClick={onCancel}>
                {t('co.upload.cancelUpload')}
              </ElButton>
            )}
            {status.value === 'error' && (
              <>
                <ElButton link type="primary" onClick={onReSend}>
                  {t('co.upload.reUpload')}
                </ElButton>
              </>
            )}
          </div>
        </div>
      );
    };
  },
});
