import { RequestInterceptor } from '@cosey/request-interceptor';
import { db } from '../db';
import { Resource } from '../utils/Resource';
import { Result } from '../utils/Result';

function isEmpty(value: unknown) {
  return value === undefined || value === null || value === '';
}

export default function register(interceptor: RequestInterceptor) {
  const prefix = '/products';

  // 批量上下架
  interceptor.patch<any, { ids: number[]; value: number }>(
    `${prefix}/bulk-status`,
    async ({ req, res }) => {
      const { ids, value } = req.body!;

      await db.products.bulkUpdate(
        ids.map((id) => {
          return {
            key: id,
            changes: {
              status: value,
              updatedAt: new Date(),
            },
          };
        }),
      );

      res.json(Result.success());
    },
  );

  new Resource(prefix, db.products, {
    list: {
      constrain(req, tableOrColl) {
        const { keyword, categoryId, status, minPrice, maxPrice, ids } = req.query;

        const idList = String(ids ?? '')
          .split(',')
          .filter(Boolean)
          .map(Number);

        // 按 ids 取一批用于回显，不能被默认分页截断
        if (idList.length > 0) {
          req.query.pageSize = idList.length;
        }

        return tableOrColl.filter((row) => {
          return (
            (!keyword || row.name.includes(keyword) || row.code.includes(keyword)) &&
            (isEmpty(categoryId) || row.categoryId === Number(categoryId)) &&
            (isEmpty(status) || row.status === Number(status)) &&
            (isEmpty(minPrice) || row.price >= Number(minPrice)) &&
            (isEmpty(maxPrice) || row.price <= Number(maxPrice)) &&
            (idList.length === 0 || idList.includes(row.id))
          );
        });
      },
      async after(rows) {
        const categories = await db.productCategories.toArray();
        const nameMap = new Map(categories.map((row) => [row.id, row.name]));

        rows.forEach((row) => {
          row.categoryName = nameMap.get(row.categoryId) ?? '';
        });

        return rows;
      },
    },
  }).intercept(interceptor);
}
