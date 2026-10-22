import { type EntityTable } from 'dexie';

export type Product = EntityTable<
  {
    id: number;
    name: string;
    code: string;
    categoryId: number;
    spec: string;
    unit: string;
    price: number;
    stock: number;
    status: number;
    cover: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
  },
  'id'
>;
