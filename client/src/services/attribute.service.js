import API from "@/api/API";

export const AttributeService = {
  getAllAttributes: () => 
    API.get('/api/admin/attributes'),

  createAttribute: (data) => 
    API.post('/api/admin/attributes', data), 

  updateAttribute: (id, data) => 
    API.put(`/api/admin/attributes/${id}`, data), 

  updateAttributeStatus: (id, status) => 
    API.patch(`/api/admin/attributes/${id}/status`, null, { params: { status } }),
};