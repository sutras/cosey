import type { AxiosRequestConfig } from 'axios';
import { inject, type InjectionKey, provide } from 'vue';

export interface UploadContext {
  request?:
    | ((
        data: Blob,
        config?: AxiosRequestConfig,
        extra?: Record<PropertyKey, any>,
      ) => Promise<string>)
    | null;
}

export const uploadContextKey = Symbol('uploadContext') as InjectionKey<UploadContext>;

export const provideUploadConfig = (context: UploadContext) => {
  provide(uploadContextKey, context);
};

export const injectUploadConfig = () => {
  return inject(uploadContextKey, null);
};
