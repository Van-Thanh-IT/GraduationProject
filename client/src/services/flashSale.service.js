import API from "@/api/API";

export const flashSaleService = {
  getAll: () => API.get('/api/admin/flash-sales'),
  create: (data) => API.post('/api/admin/flash-sales', data),
  update: (id, data) => API.put(`/api/admin/flash-sales/${id}`, data),
  updateStatus: (id, status) => API.patch(`/api/admin/flash-sales/${id}/status?status=${status}`)
};