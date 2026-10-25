import { type EntityTable } from 'dexie';

export type SocialProp = EntityTable<
  {
    id: number;
    name: string;
    icon: string;
    /** avatar_frame | chat_bubble | entrance | card */
    category: string;
    price: number;
    stock: number;
    description: string;
    /** 1 上架 0 下架 */
    status: number;
    createdAt: Date;
    updatedAt: Date;
  },
  'id'
>;
