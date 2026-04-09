import type { DeepPartial } from '../types/helper';

/**
 * http 请求配置
 */
export const defaultHttpConfig = {
  /**
   * 基础url
   */
  baseURL: '',

  /**
   * 请求超时时间，单位ms
   */
  timeout: 20 * 1000,

  /**
   * 自定义请求头
   */
  headers: {} as Record<string, string>,

  /**
   * HTTP 认证方案
   */
  authScheme: 'Bearer',

  /**
   * Token 添加到的请求头字段的键名
   */
  authHeaderKey: 'Authorization',

  /**
   * 获取属性的路径
   */
  path: {
    /**
     * 响应状态码属性的路径
     */
    code: 'code',

    /**
     * 响应信息属性的路径
     */
    message: 'message',

    /**
     * 响应数据对象属性的路径
     */
    data: 'data',
  },

  code: {
    /**
     * 响应成功状态码
     */
    success: 200,

    /**
     * 未认证状态码
     */
    unauthorized: 401,

    /**
     * 无权限状态码
     */
    forbidden: 403,
  },

  /**
   * 错误提示显示时长
   */
  errorDuration: 3000,

  /**
   * 是否直接返回 AxiosResponse 对象
   */
  originalResponse: false,

  /**
   * 是否直接返回 AxiosResponse.data 属性值
   */
  originalData: false,
};

export type HttpConfig = DeepPartial<typeof defaultHttpConfig>;
export type RequiredHttpConfig = typeof defaultHttpConfig;
