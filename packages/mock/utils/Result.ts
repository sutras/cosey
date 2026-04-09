import { mapStatusCodeMessage, type StatusCode } from '@cosey/request-interceptor';
import { type ValidateFunction } from 'ajv';

/**
 * 规范化响应数据格式
 */
export class Result {
  static success(data: any = null) {
    return {
      code: 200,
      message: '成功',
      data,
    };
  }

  static error(code: StatusCode, message?: string | ValidateFunction, data?: any) {
    return {
      code,
      message:
        typeof message === 'function'
          ? message.errors?.[0].message
          : message || mapStatusCodeMessage[code],
      data: data || null,
    };
  }
}
