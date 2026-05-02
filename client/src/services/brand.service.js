import API from "@/api/API";

export const BrandService = {
  getAllBrands: () => 
    API.get('/admin/brands'),

  createBrand: (formData) => 
    API.post('/admin/brands', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  updateBrand: (id, formData) => 
    API.put(`/admin/brands/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // Backend dùng @PatchMapping và @RequestParam
  updateBrandStatus: (id, status) => 
    API.patch(`/admin/brands/${id}/status`, null, { params: { status } }),
};