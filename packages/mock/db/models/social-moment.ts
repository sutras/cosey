import { type EntityTable } from 'dexie';

export type SocialMoment = EntityTable<
  {
    id: number;
    userId: number;
    topicId: number;
    content: string;
    images: string[];
    likeCount: number;
    commentCount: number;
    /** 1 正常 0 隐藏 */
    status: number;
    createdAt: Date;
    updatedAt: Date;
  },
  'id'
>;
