import API from "@/api/API";

export const ProductService = {

  getProductStatsById: (productId) => 
    API.get(`/api/management/dashboard/stats/${productId}`),

  getAllProducts: () => 
    API.get('/api/management/products'),

  createProduct: (data) => 
    API.post('/api/management/products', data),

  updateProduct: (id, data) => 
    API.put(`/api/management/products/${id}`, data),

  updateProductStatus: (id, status) => 
    API.patch(`/api/management/products/${id}/status`, null, { params: { status } }),
  
  getAttributesByProductId: (productId) => 
    API.get(`/api/management/products/${productId}/attributes`),

  addAttributeToProduct: (productId, data) => 
    API.post(`/api/management/products/${productId}/attributes`, data),

  updateProductAttribute: (attributeId, data) => 
    API.put(`/api/management/products/attributes/${attributeId}`, data),

  deleteProductAttribute: (attributeId) => 
    API.delete(`/api/management/products/attributes/${attributeId}`),


   searchSimpleVariants: (keyword = '', limit = 20) => {
    return API.get(`/api/management/products/variants/search-simple`, {
      params: { keyword, limit }
    });
  },

  getVariantsByProduct: (productId) => 
    API.get(`/api/management/products/${productId}/variants`),

  createVariant: (productId, data) => 
    API.post(`/api/management/products/${productId}/variants`, data),

  updateVariant: (variantId, data) => {
      console.log(data);
      return API.put(`/api/management/products/variants/${variantId}`, data)
  },
   

  softDeleteVariant: (variantId) => 
    API.delete(`/api/management/products/variants/${variantId}`),

  
  uploadVariantImages: (variantId, files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file); 
    });

    return API.post(`/api/management/products/variants/${variantId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  deleteVariantImage: (imageId) => 
    API.delete(`/api/management/products/images/${imageId}`),

  setThumbnail: (imageId) => 
    API.put(`/api/management/products/images/${imageId}/thumbnail`),

  /////////////////////////////////////////////////////////
  //CLIENT
   searchAndFilterProducts: (params) => API.get('/api/public/products', { params }),
   getProductBySlug: (slug) => API.get(`/api/public/products/${slug}`),

  
};



