import API from "@/api/API";

export const BrandService = {
  getAllBrands: () => 
    API.get('/api/admin/brands'),

  createBrand: (formData) => 
    API.post('/api/admin/brands', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  updateBrand: (id, formData) => 
    API.put(`/api/admin/brands/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // Backend dùng @PatchMapping và @RequestParam
  updateBrandStatus: (id, status) => 
    API.patch(`/api/admin/brands/${id}/status`, null, { params: { status } }),
};