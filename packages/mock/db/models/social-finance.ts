import { type EntityTable } from 'dexie';

export type SocialFinance = EntityTable<
  {
    id: number;
    userId: number;
    /** recharge | consume | withdraw | reward */
    type: string;
    amount: number;
    /** 变动后余额 */
    balance: number;
    /** success | pending | failed */
    status: string;
    remark: string;
    createdAt: Date;
    updatedAt: Date;
  },
  'id'
>;
