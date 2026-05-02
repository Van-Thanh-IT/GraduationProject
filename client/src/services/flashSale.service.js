import API from "@/api/API";

export const flashSaleService = {
  getAll: () => API.get('/admin/flash-sales'),
  create: (data) => API.post('/admin/flash-sales', data),
  update: (id, data) => API.put(`/admin/flash-sales/${id}`, data),
  updateStatus: (id, status) => API.patch(`/admin/flash-sales/${id}/status?status=${status}`)
};