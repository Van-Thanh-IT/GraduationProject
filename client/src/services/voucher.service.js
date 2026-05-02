import API from "@/api/API";

export const voucherService = {
  getAll: () => API.get('/admin/vouchers'),
  create: (data) => API.post('/admin/vouchers', data),
  update: (id, data) => API.put(`/admin/vouchers/${id}`, data),
  delete: (id) => API.delete(`/admin/vouchers/${id}`),

  //CLIENT
  getAvailableVouchers: () => API.get('/public/vouchers/available'),
  previewDiscount: (code, orderTotal) => 
    API.get('/public/vouchers/preview-discount', {
      params: { code, orderTotal }
    })

};