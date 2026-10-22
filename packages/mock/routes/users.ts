import { RequestInterceptor } from '@cosey/request-interceptor';
import { db } from '../db';
import { Resource } from '../utils/Resource';
import { Result } from '../utils/Result';

export default function register(interceptor: RequestInterceptor) {
  const prefix = '/users';

  interceptor.patch<any, { ids: number[]; value: number }>(
    `${prefix}/bulk-silent`,
    async ({ req, res }) => {
      const { ids, value } = req.body!;

      const result = await db.users.bulkUpdate(
        ids.map((id) => {
          return {
            key: id,
            changes: {
              silent: value,
            },
          };
        }),
      );

      res.json(Result.success(result));
    },
  );

  new Resource(prefix, db.users, {
    list: {
      constrain(req, tableOrColl) {
        const { nickname, mobile, name, gender, birthday, silent, createdAt } = req.query;

        const birthday_start = birthday && new Date(birthday[0]);
        const birthday_end = birthday && new Date(birthday[1]);

        const createdAt_start = createdAt && new Date(createdAt[0]);
        const createdAt_end = createdAt && new Date(createdAt[1]);

        return tableOrColl.filter((row) => {
          return (
            (!nickname || row.nickname.includes(nickname)) &&
            (!mobile || row.mobile.includes(mobile)) &&
            (!name || row.name.includes(name)) &&
            (!gender || row.gender.includes(gender)) &&
            (!birthday || (row.birthday >= birthday_start && row.birthday <= birthday_end)) &&
            (!createdAt || (row.createdAt >= createdAt_start && row.createdAt <= createdAt_end)) &&
            (!silent || row.silent === Number(silent))
          );
        });
      },
    },
  }).intercept(interceptor);
}
