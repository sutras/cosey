import { RequestInterceptor } from '@cosey/request-interceptor';
import { db } from '../db';
import { Result } from '../utils/Result';
import { generateTokens, jwt } from '../utils/jwt';
import { PermissionRow } from '../db/models/permission';
import { omit } from 'lodash-es';

export default function register(interceptor: RequestInterceptor) {
  const prefix = '/rbac/auth';

  interceptor.post(
    `${prefix}/login`,
    async ({ req, res }) => {
      const row = await db.admins.get({
        username: req.body.username,
        password: req.body.password,
      });

      if (!row) {
        return res.json(Result.error(401, '账号或密码不正确'));
      }

      return res.json(Result.success(generateTokens(row.id, row.username)));
    },
    {
      skipAuth: true,
    },
  );

  interceptor.post(
    `${prefix}/refresh-token`,
    async ({ req, res }) => {
      try {
        const verifyResult = jwt.verify(req.body.refreshToken);

        if (verifyResult instanceof Error) {
          throw new Error();
        }

        if (verifyResult.type !== 'refresh') {
          throw new Error();
        }

        const row = await db.admins.get({
          id: verifyResult.sub,
        });

        if (!row) {
          throw new Error();
        }

        return res.json(Result.success(generateTokens(row.id, row.username)));
      } catch {
        return res.json(
          Result.error(401, 'Invalid token', {
            type: 'refreshToken',
          }),
        );
      }
    },
    {
      skipAuth: true,
    },
  );

  interceptor.get(`${prefix}/info`, async ({ req, res }) => {
    const { id, superAdmin } = req.payload.user;

    const row = await db.admins.get({
      id,
    });

    if (!row) {
      return res.json(Result.error(404));
    }

    let permissions: PermissionRow[] = [];

    if (superAdmin) {
      permissions = await db.permissions.toArray();
    } else {
      const adminRole = await db.adminRoles.get({
        adminId: id,
      });

      if (!adminRole) {
        return res.json(Result.error(404));
      }

      const permissionIds = (
        await db.permissionRoles
          .where({
            roleId: adminRole.roleId,
          })
          .toArray()
      ).map((row) => row.permissionId);

      permissions = await db.permissions.where('id').anyOf(permissionIds).toArray();
    }

    const rest = omit(row!, ['password', 'createdAt', 'updatedAt']);

    res.json(
      Result.success({
        ...rest,
        permissions: permissions.map((row) => {
          return {
            action: row.action,
            subject: row.subject,
            conditions: row.conditions,
            name: row.name,
          };
        }),
      }),
    );
  });

  interceptor.post(`${prefix}/change-password`, async ({ req, res }) => {
    const { id } = req.payload.user;

    const { oldPassword, newPassword } = req.body;

    const row = await db.admins.get({
      id,
    });

    if (!row) {
      return res.json(Result.error(404));
    }

    if (row.password !== oldPassword) {
      return res.json(Result.error(400, '原密码错误'));
    }

    const result = await db.admins.update(id, {
      password: newPassword,
    });

    res.json(Result.success(result));
  });
}
