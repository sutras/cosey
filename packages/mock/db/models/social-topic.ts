import { type EntityTable } from 'dexie';

export type SocialTopic = EntityTable<
  {
    id: number;
    name: string;
    description: string;
    cover: string;
    momentCount: number;
    sort: number;
    /** 1 启用 0 停用 */
    status: number;
    createdAt: Date;
    updatedAt: Date;
  },
  'id'
>;
