import {
  createRequestInterceptor,
  interceptImage,
  type RequestInterceptorInit,
} from '@cosey/request-interceptor';

import { db, initSeed, resetDB } from './db';
import { type ContentType, HttpMessage, HttpMessageManager } from './httpMessageManager';
import { Result } from './utils/Result';
import { jwt } from './utils/jwt';
import register from './routes';
import { omit } from 'lodash-es';

export { resetDB, HttpMessageManager };

export type { ContentType, HttpMessage };

export function createMock(
  options: { skipAuth?: boolean; requestInterceptorInit?: RequestInterceptorInit } = {},
) {
  initSeed();

  const httpMessageManager = new HttpMessageManager();

  const intercept = () => {
    const interceptor = createRequestInterceptor({
      prefix: '/mock/api',
      ...options.requestInterceptorInit,
    });

    // 注册路由
    register(interceptor);

    // 添加拦截守卫，处理身份验证
    interceptor.addGuard(async ({ req, res, payload }) => {
      try {
        if (options.skipAuth) {
          return true;
        }

        if (payload?.skipAuth) {
          return true;
        }

        const token = req.get('Authorization');

        if (!token) {
          throw new Error('No token provided');
        }

        const verifyResult = jwt.verify(token);

        if (verifyResult instanceof Error) {
          throw new Error(verifyResult.message);
        }

        if (verifyResult.type !== 'access') {
          throw new Error();
        }

        const row = await db.admins.get({
          id: verifyResult.sub,
        });

        const rest = omit(row!, 'password');

        req.payload.user = rest;

        return true;
      } catch {
        return res.json(
          Result.error(401, 'Invalid token', {
            type: 'accessToken',
          }),
        );
      }
    });

    // 记录拦截的请求
    interceptor.beforeRequest = (req) => {
      httpMessageManager.setRequest(req);
    };

    interceptor.afterResponse = (req, res) => {
      httpMessageManager.setResponse(req, res);
    };

    // 拦截图片、音视频
    interceptImage(async (url) => {
      url = String(url);
      if (url.startsWith('/mock/uploads/')) {
        url = url.split('?')[0];
        const row = await db.assets.get({
          url,
        });
        if (row) {
          return row.dataURL;
        }
      }
    });

    return {};
  };

  return {
    httpMessageManager,
    intercept,
  };
}
