import type { DeepPartial } from '../types/helper';
import type { AxiosRequestConfig } from 'axios';

/**
 * 请求接口
 */
export const defaultApiConfig = {
  /**
   * 文件上传
   */
  upload: null as
    | ((
        data: Blob,
        config?: AxiosRequestConfig,
        extra?: Record<PropertyKey, any>,
      ) => Promise<string>)
    | null,

  /**
   * 登录
   */
  login: null as ((data: any, config?: AxiosRequestConfig) => Promise<string>) | null,

  /**
   * 修改密码
   */
  changePassword: null as ((data: any, config?: AxiosRequestConfig) => Promise<any>) | null,

  /**
   * 退出
   */
  logout: null as ((config?: AxiosRequestConfig) => Promise<any>) | null,
};

export type ApiConfig = DeepPartial<typeof defaultApiConfig>;
export type RequiredApiConfig = typeof defaultApiConfig;
