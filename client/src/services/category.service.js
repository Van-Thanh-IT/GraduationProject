import API from "@/api/API";

export const CategoryService = {
  getAllCategories: () => 
    API.get('/admin/categories'),

  createCategory: (formData) => 
    API.post('/admin/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  updateCategory: (id, formData) => 
    API.put(`/admin/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // Lưu ý: Backend của bạn dùng @DeleteMapping cho việc update status
  updateCategoryStatus: (id, status) => 
    API.delete(`/admin/categories/${id}`, { params: { status } }),
};