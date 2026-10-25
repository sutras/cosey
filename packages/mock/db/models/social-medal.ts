import { type EntityTable } from 'dexie';

export type SocialMedal = EntityTable<
  {
    id: number;
    name: string;
    icon: string;
    description: string;
    /** 获取条件 */
    condition: string;
    sort: number;
    /** 1 启用 0 停用 */
    status: number;
    createdAt: Date;
    updatedAt: Date;
  },
  'id'
>;
