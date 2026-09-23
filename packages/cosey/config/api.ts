import type { DeepPartial } from '../types/helper';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface LoginFormModel {
  username: string;
  password: string;
  captcha?: string;
  captchaId?: string;
}

export interface CaptchaResponseData {
  image: string;
  id: string;
}

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
  login: null as ((data: LoginFormModel, config?: AxiosRequestConfig) => Promise<string>) | null,

  /**
   * 验证码
   */
  captcha: null as
    | ((data: any, config?: AxiosRequestConfig) => Promise<CaptchaResponseData>)
    | null,

  /**
   * 修改密码
   */
  changePassword: null as ((data: any, config?: AxiosRequestConfig) => Promise<any>) | null,

  /**
   * 退出
   */
  logout: null as ((config?: AxiosRequestConfig) => Promise<any>) | null,

  /**
   * 刷新 access token
   */
  refreshToken: null as ((config?: AxiosRequestConfig) => Promise<string>) | null,

  /**
   * 判断是否为 access token 过期（有可能是refresh token过期）
   */
  isAccessTokenExpired: null as ((response: AxiosResponse<any, any>) => boolean) | null,
};

export type ApiConfig = DeepPartial<typeof defaultApiConfig>;
export type RequiredApiConfig = typeof defaultApiConfig;
