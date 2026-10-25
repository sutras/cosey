import { RequestInterceptor } from '@cosey/request-interceptor';
import { db } from '../db';
import { Resource } from '../utils/Resource';

/** 查询参数为空时不参与筛选（`0` 也要能筛出来） */
function eq(value: any, expect: any) {
  return expect === undefined || expect === '' || String(value) === String(expect);
}

function includes(value: string | undefined, keyword: any) {
  return !keyword || (value || '').includes(keyword);
}

export default function register(interceptor: RequestInterceptor) {
  // 话题
  new Resource('/social/topics', db.socialTopics, {
    list: {
      constrain(req, tableOrColl) {
        const { name, status } = req.query;
        return tableOrColl.filter((row) => includes(row.name, name) && eq(row.status, status));
      },
    },
  }).intercept(interceptor);

  // 动态
  new Resource('/social/moments', db.socialMoments, {
    list: {
      constrain(req, tableOrColl) {
        const { content, userId, topicId, status } = req.query;
        return tableOrColl.filter(
          (row) =>
            includes(row.content, content) &&
            eq(row.userId, userId) &&
            eq(row.topicId, topicId) &&
            eq(row.status, status),
        );
      },
      async after(rows) {
        await Promise.all(
          rows.map(async (row) => {
            const [topic, user] = await Promise.all([
              db.socialTopics.get(row.topicId),
              db.users.get(row.userId),
            ]);

            row.topicName = topic?.name || '';
            row.userNickname = user?.nickname || '';
            row.userAvatar = user?.avatar || '';
          }),
        );

        return rows;
      },
    },
  }).intercept(interceptor);

  // 勋章
  new Resource('/social/medals', db.socialMedals, {
    list: {
      constrain(req, tableOrColl) {
        const { name, status } = req.query;
        return tableOrColl.filter((row) => includes(row.name, name) && eq(row.status, status));
      },
    },
  }).intercept(interceptor);

  // 道具
  new Resource('/social/props', db.socialProps, {
    list: {
      constrain(req, tableOrColl) {
        const { name, category, status } = req.query;
        return tableOrColl.filter(
          (row) => includes(row.name, name) && eq(row.category, category) && eq(row.status, status),
        );
      },
    },
  }).intercept(interceptor);

  // 礼物
  new Resource('/social/gifts', db.socialGifts, {
    list: {
      constrain(req, tableOrColl) {
        const { name, status } = req.query;
        return tableOrColl.filter((row) => includes(row.name, name) && eq(row.status, status));
      },
    },
  }).intercept(interceptor);

  // 公会
  new Resource('/social/guilds', db.socialGuilds, {
    list: {
      constrain(req, tableOrColl) {
        const { name, ownerId, status } = req.query;
        return tableOrColl.filter(
          (row) => includes(row.name, name) && eq(row.ownerId, ownerId) && eq(row.status, status),
        );
      },
      async after(rows) {
        await Promise.all(
          rows.map(async (row) => {
            const owner = await db.users.get(row.ownerId);
            row.ownerNickname = owner?.nickname || '';
            row.ownerAvatar = owner?.avatar || '';
          }),
        );

        return rows;
      },
    },
  }).intercept(interceptor);

  // 财务流水
  new Resource('/social/finances', db.socialFinances, {
    list: {
      constrain(req, tableOrColl) {
        const { userId, type, status, createdAt } = req.query;

        const start = createdAt && new Date(createdAt[0]);
        const end = createdAt && new Date(createdAt[1]);

        return tableOrColl.filter(
          (row) =>
            eq(row.userId, userId) &&
            eq(row.type, type) &&
            eq(row.status, status) &&
            (!createdAt || (row.createdAt >= start && row.createdAt <= end)),
        );
      },
      async after(rows) {
        await Promise.all(
          rows.map(async (row) => {
            const user = await db.users.get(row.userId);
            row.userNickname = user?.nickname || '';
            row.userAvatar = user?.avatar || '';
          }),
        );

        return rows;
      },
    },
  }).intercept(interceptor);

  // 会员等级
  new Resource('/social/vips', db.socialVips, {
    list: {
      constrain(req, tableOrColl) {
        const { name, status } = req.query;
        return tableOrColl.filter((row) => includes(row.name, name) && eq(row.status, status));
      },
    },
  }).intercept(interceptor);
}
