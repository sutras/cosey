import { type EntityTable } from 'dexie';

export type ProductCategory = EntityTable<
  {
    id: number;
    name: string;
    description: string;
    sort: number;
    createdAt: Date;
    updatedAt: Date;
  },
  'id'
>;
