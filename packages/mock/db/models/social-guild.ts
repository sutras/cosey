import { type EntityTable } from 'dexie';

export type SocialGuild = EntityTable<
  {
    id: number;
    name: string;
    avatar: string;
    ownerId: number;
    memberCount: number;
    level: number;
    notice: string;
    /** 1 正常 0 解散 */
    status: number;
    createdAt: Date;
    updatedAt: Date;
  },
  'id'
>;
