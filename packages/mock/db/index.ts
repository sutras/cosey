import Dexie from 'dexie';

import { type DB } from './types';
import { seed, seedProducts, seedSocial, seedSocialPermissions } from './seeder';

export const db = new Dexie('CoseyAdminDB') as DB;

const schemaV1 = {
  admins: '++id, username, password, nickname, avatar, superAdmin, createdAt, updatedAt',
  roles: '++id, name, createdAt, updatedAt',
  permissions: '++id, pid, action, subject, conditions, name, order, createdAt, updatedAt',
  permissionRoles: '++id, roleId, permissionId, createdAt, updatedAt',
  adminRoles: '++id, roleId, adminId, createdAt, updatedAt',
  users:
    '++id, nickname, mobile, name, gender, birthday, constellation, height, weight, qualification, trait, friendshipType, hobbies, signature, avatar, address, silent, createdAt, updatedAt',
  assets: '++id, dataURL, uuid, name, size, type, url, createdAt, updatedAt',
  enums: '++id, name, remark, createdAt, updatedAt',
  enumItems: '++id, enumId, name, value, createdAt, updatedAt',
  posts:
    '++id, postTypeId, title, content, digest, cover, createdBy, createdAt, updatedBy, updatedAt, scheduledAt, publishedBy, publishedAt, deletedBy, deletedAt',
  postTypes: '++id, pid, name, description, createdAt, updatedAt',
  postComments: '++id, userId, pid, postId, content, createdAt, updatedAt, deletedAt',
  configGroups: '++id, name, createdAt, updatedAt',
  configs: '++id, groupId, type, name, value, key, createdAt, updatedAt',
};

export const schema = {
  ...schemaV1,
  productCategories: '++id, name, sort, createdAt, updatedAt',
  products: '++id, name, code, categoryId, spec, price, stock, status, createdAt, updatedAt',
};

export const schemaV3 = {
  ...schema,
  socialTopics: '++id, name, sort, status, momentCount, createdAt, updatedAt',
  socialMoments: '++id, userId, topicId, likeCount, commentCount, status, createdAt, updatedAt',
  socialMedals: '++id, name, sort, status, createdAt, updatedAt',
  socialProps: '++id, name, category, price, stock, status, createdAt, updatedAt',
  socialGifts: '++id, name, price, charm, status, createdAt, updatedAt',
  socialGuilds: '++id, name, ownerId, memberCount, level, status, createdAt, updatedAt',
  socialFinances: '++id, userId, type, amount, status, createdAt, updatedAt',
  socialVips: '++id, level, name, price, duration, status, createdAt, updatedAt',
};

// 数据库表设计
db.version(1).stores(schemaV1);
db.version(2).stores(schema);
db.version(3).stores(schemaV3);

/**
 * 重置数据库
 */
export async function resetDB() {
  await db.delete();
  await db.open();
  await seed(db);
}

/**
 * 种子数据版本
 *
 * 改种子文案或结构后递增，老库会在下次启动时自动重建（本地 mock 数据，可丢弃）。
 */
const SEED_VERSION = '3';

/**
 * 初始化数据库
 *
 * 返回的 promise 在种子数据就绪后才 resolve，接口处理前应等待它，
 * 否则首次访问时请求会撞上 `db.delete()` 而报 DatabaseClosedError。
 */
export function initSeed() {
  if (!seedTask) {
    seedTask = (async () => {
      const version = localStorage.getItem('mockSeedVersion');

      if (!localStorage.getItem('mockSeeded') || version !== SEED_VERSION) {
        await resetDB();
        localStorage.setItem('mockSeeded', 'true');
        localStorage.setItem('mockSeedVersion', SEED_VERSION);
        return;
      }

      // 老数据没有商品表，补一次种子数据，不重建整个库
      const count = await db.products.count();
      if (count === 0) {
        await seedProducts(db);
      }

      // 老数据同样没有社交表
      const socialCount = await db.socialTopics.count();
      if (socialCount === 0) {
        await seedSocial(db);
      }

      // 老数据没有社交模块的权限项
      await seedSocialPermissions(db);
    })();
  }

  return seedTask;
}

let seedTask: Promise<void> | null = null;
