import productsApi from '@/api/products';
import type { FormQueryProps } from 'cosey/components';

export interface Product {
  id: number;
  name: string;
  code: string;
  categoryId: number;
  categoryName: string;
  spec: string;
  unit: string;
  price: number;
  stock: number;
  status: number;
}

export const columns = [
  { prop: 'name', label: '商品名', minWidth: 220 },
  { prop: 'categoryName', label: '分类', width: 110 },
  { prop: 'price', label: '价格', width: 90 },
  { prop: 'stock', label: '库存', width: 80 },
];

export const formProps: FormQueryProps = {
  schemes: [
    { prop: 'keyword', label: '商品名/编码', modelValue: '' },
    {
      prop: 'status',
      label: '状态',
      fieldType: 'select',
      modelValue: undefined,
      fieldProps: {
        clearable: true,
        options: [
          { label: '上架', value: 1 },
          { label: '下架', value: 0 },
        ],
      },
    },
    { prop: 'minPrice', label: '最低价', modelValue: '' },
    { prop: 'maxPrice', label: '最高价', modelValue: '' },
  ],
};

export const queryProducts = (params: any) => {
  if (import.meta.env.SSR) {
    return { list: [], total: 0 };
  }

  return productsApi.getProducts(params);
};

export const pickProducts = (ids: number[]) => {
  if (import.meta.env.SSR) {
    return [];
  }

  return productsApi.getProducts({ ids: ids.join(',') }).then((res: any) => res.list as Product[]);
};
