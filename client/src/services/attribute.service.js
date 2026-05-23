import API from "@/api/API";

export const AttributeService = {
  getAllAttributes: () => 
    API.get('/admin/attributes'),

  createAttribute: (data) => 
    API.post('/admin/attributes', data), 

  updateAttribute: (id, data) => 
    API.put(`/admin/attributes/${id}`, data), 

  updateAttributeStatus: (id, status) => 
    API.patch(`/admin/attributes/${id}/status`, null, { params: { status } }),
};