import API from "@/api/API";

export const ProductService = {

  getProductStatsById: (productId) => 
    API.get(`/management/dashboard/stats/${productId}`),

  getAllProducts: () => 
    API.get('/management/products'),

  createProduct: (data) => 
    API.post('/management/products', data),

  updateProduct: (id, data) => 
    API.put(`/management/products/${id}`, data),

  updateProductStatus: (id, status) => 
    API.patch(`/management/products/${id}/status`, null, { params: { status } }),
  
  getAttributesByProductId: (productId) => 
    API.get(`/management/products/${productId}/attributes`),

  addAttributeToProduct: (productId, data) => 
    API.post(`/management/products/${productId}/attributes`, data),

  updateProductAttribute: (attributeId, data) => 
    API.put(`/management/products/attributes/${attributeId}`, data),

  deleteProductAttribute: (attributeId) => 
    API.delete(`/management/products/attributes/${attributeId}`),


   searchSimpleVariants: (keyword = '', limit = 20) => {
    return API.get(`/management/products/variants/search-simple`, {
      params: { keyword, limit }
    });
  },

  getVariantsByProduct: (productId) => 
    API.get(`/management/products/${productId}/variants`),

  createVariant: (productId, data) => 
    API.post(`/management/products/${productId}/variants`, data),

  updateVariant: (variantId, data) => {
      console.log(data);
      return API.put(`/management/products/variants/${variantId}`, data)
  },
   

  softDeleteVariant: (variantId) => 
    API.delete(`/management/products/variants/${variantId}`),

  
  uploadVariantImages: (variantId, files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file); 
    });

    return API.post(`/management/products/variants/${variantId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  deleteVariantImage: (imageId) => 
    API.delete(`/management/products/images/${imageId}`),

  setThumbnail: (imageId) => 
    API.put(`/management/products/images/${imageId}/thumbnail`),

  /////////////////////////////////////////////////////////
  //CLIENT
   searchAndFilterProducts: (params) => API.get('/public/products', { params }),
   getProductBySlug: (slug) => API.get(`/public/products/${slug}`),

  
};



