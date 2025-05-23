import { defineRoutes } from '../../utils';
import MergedLayoutException from '../../../layout/merged/layout-exception';
import MergedLayoutForbidden from '../../../layout/merged/layout-forbidden';
import MergedLayoutInternalServerError from '../../../layout/merged/layout-internal-server-error';
import { NotFoundRoute } from '../../not-found';

/**
 * 异常相关路由
 */
export default defineRoutes([
  {
    path: '/exception',
    name: 'Exception',
    component: MergedLayoutException,
    meta: {
      hideInMenu: true,
    },
    children: [
      {
        ...NotFoundRoute,
        path: '',
        name: undefined,
      },
      {
        path: 'forbidden',
        name: 'ExceptionForbidden',
        component: MergedLayoutForbidden,
        meta: {
          title: 'Forbidden',
        },
      },
      {
        path: 'internal-server-error',
        name: 'ExceptionInternalServerError',
        component: MergedLayoutInternalServerError,
        meta: {
          title: 'Internal Server Error',
        },
      },
      NotFoundRoute,
    ],
  },
]);
