import API from "@/api/API";

export const AttributeService = {
  getAllAttributes: () => 
    API.get('/admin/attributes'),

  getAttributeById: (id) => 
    API.get(`/admin/attributes/${id}`),

  createAttribute: (data) => 
    API.post('/admin/attributes', data), // Gửi JSON

  updateAttribute: (id, data) => 
    API.put(`/admin/attributes/${id}`, data), // Gửi JSON

  updateAttributeStatus: (id, status) => 
    API.patch(`/admin/attributes/${id}/status`, null, { params: { status } }),
};