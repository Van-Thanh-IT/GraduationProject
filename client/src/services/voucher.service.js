import API from "@/api/API";

export const voucherService = {
  getAll: () => API.get('/api/admin/vouchers'),
  create: (data) => API.post('/api/admin/vouchers', data),
  update: (id, data) => API.put(`/api/admin/vouchers/${id}`, data),
  delete: (id) => API.delete(`/api/admin/vouchers/${id}`),

  //CLIENT
  getAvailableVouchers: () => API.get('/api/public/vouchers/available'),
  previewDiscount: (code, orderTotal) => 
    API.get('/api/public/vouchers/preview-discount', {
      params: { code, orderTotal }
    })

};