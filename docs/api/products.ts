import { http } from 'cosey';

const Api = {
  ProductsResource: '/products',
  ProductCategoriesResource: '/product-categories',
};

export default {
  getProducts: (params?: any) => {
    return http.get(Api.ProductsResource, {
      params,
    });
  },

  getProductCategories: (params?: any) => {
    return http.get(Api.ProductCategoriesResource, {
      params,
    });
  },
};
