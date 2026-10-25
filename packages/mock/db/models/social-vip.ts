import { type EntityTable } from 'dexie';

export type SocialVip = EntityTable<
  {
    id: number;
    level: number;
    name: string;
    icon: string;
    /** 开通价格（元） */
    price: number;
    /** 时长（天） */
    duration: number;
    /** 权益说明，逗号分隔 */
    benefits: string;
    /** 1 启用 0 停用 */
    status: number;
    createdAt: Date;
    updatedAt: Date;
  },
  'id'
>;
