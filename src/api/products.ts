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

  getProduct: (id: number) => {
    return http.get(`${Api.ProductsResource}/${id}`);
  },

  addProduct: (data: any) => {
    return http.post(Api.ProductsResource, data);
  },

  updateProduct: (id: number, data: any) => {
    return http.patch(`${Api.ProductsResource}/${id}`, data);
  },

  deleteProduct: (id: number) => {
    return http.delete(`${Api.ProductsResource}/${id}`);
  },

  updateBulkStatus: (data: { ids: number[]; value: number }) => {
    return http.patch(`${Api.ProductsResource}/bulk-status`, data);
  },

  getProductCategories: (params?: any) => {
    return http.get(Api.ProductCategoriesResource, {
      params,
    });
  },

  addProductCategory: (data: any) => {
    return http.post(Api.ProductCategoriesResource, data);
  },

  updateProductCategory: (id: number, data: any) => {
    return http.patch(`${Api.ProductCategoriesResource}/${id}`, data);
  },

  deleteProductCategory: (id: number) => {
    return http.delete(`${Api.ProductCategoriesResource}/${id}`);
  },
};
