import { type EntityTable } from 'dexie';

export type SocialGift = EntityTable<
  {
    id: number;
    name: string;
    icon: string;
    price: number;
    /** 赠送后增加的好感值 */
    charm: number;
    description: string;
    /** 1 上架 0 下架 */
    status: number;
    createdAt: Date;
    updatedAt: Date;
  },
  'id'
>;
