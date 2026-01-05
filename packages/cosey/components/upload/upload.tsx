import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  reactive,
  ref,
  toRaw,
  watch,
} from 'vue';
import {
  type UploadProps,
  type UploadFile,
  uploadProps,
  uploadSlots,
  uploadEmits,
} from './upload.api';
import { CHANGE_EVENT, ElMessage, useFormItem } from 'element-plus';
import {
  chooseFiles,
  getFileType,
  isShallowEqual,
  auid,
  isString,
  getBasename,
  debugWarn,
} from '../../utils';
import UploadItem from './upload-item';
import { TransitionGroup } from '../transition-group';
import Icon from '../icon/icon';

import useStyle from './upload.style';
import { useComponentConfig } from '../config-provider';
import { useLocale } from '../../hooks';
import { injectUploadConfig } from '../../config/upload';

export default defineComponent({
  name: 'CoUpload',
  props: uploadProps,
  slots: uploadSlots,
  emits: uploadEmits,
  setup(props, { emit }) {
    const { t } = useLocale();

    const { prefixCls } = useComponentConfig('upload');

    const { hashId } = useStyle(prefixCls);

    const { request } = injectUploadConfig() || {};

    const mergedLimit = computed(() => (props.single ? 1 : props.limit));

    const mergedMultiple = computed(() => (props.single ? false : props.multiple));

    const fileList = ref<UploadFile[]>([]);

    const showSelect = computed(
      () =>
        !props.readonly &&
        !props.disabled &&
        (!mergedLimit.value || fileList.value.length < mergedLimit.value),
    );

    let innerValue: UploadProps['modelValue'];

    const { formItem } = useFormItem();

    watch(
      () => props.modelValue,
      () => {
        if (props.validateEvent) {
          formItem?.validate?.(CHANGE_EVENT).catch(debugWarn);
        }
      },
    );

    watch(
      () => props.modelValue,
      (newValue) => {
        // 内部变动
        if (innerValue === toRaw(newValue)) {
          return;
        }

        innerValue = toRaw(newValue);

        const urls = Array.isArray(newValue) ? newValue : newValue ? [newValue] : [];

        fileList.value = urls.map((item): UploadFile => {
          return reactive({
            raw: null,
            name: isString(item) ? getBasename(item) : '',
            type: getFileType(item) || 'image',
            size: 0,
            url: item,
            previewUrl: item instanceof File ? URL.createObjectURL(item) : item,
            key: auid(),
            percent: 0,
            status: 'unready',
            controller: null,
          });
        });
      },
      { immediate: true },
    );

    onBeforeUnmount(() => {
      fileList.value.forEach((item) => {
        if (isString(item.previewUrl) && item.previewUrl.indexOf('blob:') === 0) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    });

    const onSelect = async () => {
      const files = await chooseFiles({
        multiple: mergedMultiple.value,
        accept: props.accept,
      });

      if (mergedLimit.value && fileList.value.length + files.length > mergedLimit.value) {
        emit('exceed');
        ElMessage.warning(
          t('co.upload.maxUpload', {
            num: mergedLimit.value,
          }),
        );
        return;
      }

      files.forEach((rawFile) => {
        const file: UploadFile = reactive({
          raw: rawFile,
          name: rawFile.name,
          type: getFileType(rawFile),
          size: rawFile.size,
          url: '',
          previewUrl: URL.createObjectURL(rawFile),
          key: auid(),
          status: 'ready',
          percent: 0,
          controller: null,
        });
        fileList.value.push(file);

        if (props.selectOnly) {
          file.percent = 100;
          file.url = rawFile;
          file.status = 'success';
          nextTick(() => {
            syncProp();
          });
        } else {
          upload(file);
        }
      });
    };

    const upload = (file: UploadFile) => {
      file.controller = new AbortController();

      const options = {
        signal: file.controller.signal,
        data: file.raw!,
        onProgress: (percent: number) => {
          file.percent = percent;
        },
        onSuccess: (url: string) => {
          file.url = url;
          file.status = 'success';
          nextTick(() => {
            syncProp();
          });
        },
        onError: () => {
          file.status = 'error';
        },
      };

      file.status = 'loading';

      return doUpload(options);
    };

    const doUpload = async (options: {
      signal: AbortSignal;
      data: File;
      onProgress: (percent: number) => void;
      onSuccess: (url: string) => void;
      onError: () => void;
    }) => {
      return (props.request || request)?.(
        options.data,
        {
          ...props.requestConfig,
          signal: options.signal,
          onUploadProgress(event) {
            if (event.total) {
              options.onProgress((event.loaded / event.total) * 100);
            }
            props.requestConfig?.onUploadProgress?.(event);
          },
        },
        props.requestExtra,
      )
        .then((url) => {
          options.onSuccess(url);
        })
        .catch(() => {
          options.onError();
        });
    };

    const syncProp = () => {
      const urls = fileList.value.map((file) => {
        return file.url;
      });
      const nextValue = props.single ? urls[0] : urls;

      if (
        innerValue === nextValue ||
        (Array.isArray(nextValue) &&
          Array.isArray(innerValue) &&
          isShallowEqual(nextValue, innerValue))
      ) {
        return;
      }

      innerValue = nextValue;
      emit('update:modelValue', nextValue);
      emit('change', nextValue);
    };

    const onCancel = (file: UploadFile) => {
      file.controller?.abort();
      file.status = 'error';
    };

    const onReUpload = (file: UploadFile) => {
      file.percent = 0;
      upload(file);
    };

    const onRemove = (file: UploadFile) => {
      if (file.status === 'loading') {
        onCancel(file);
      }
      fileList.value.splice(fileList.value.indexOf(file), 1);
      syncProp();
    };

    return () => {
      return (
        <div class={[hashId.value, prefixCls.value]}>
          <TransitionGroup effect="fade">
            {fileList.value.map((file) => {
              return (
                <UploadItem
                  key={file.key}
                  file={file}
                  readonly={props.readonly}
                  size={props.size}
                  onRemove={() => onRemove(file)}
                  onRe-upload={() => onReUpload(file)}
                  onCancel={() => onCancel(file)}
                />
              );
            })}
          </TransitionGroup>

          {showSelect.value && (
            <div class={[`${prefixCls.value}-select`, `is-${props.size}`]} onClick={onSelect}>
              <Icon name="co:add-large" size="24" />
            </div>
          )}
        </div>
      );
    };
  },
});
