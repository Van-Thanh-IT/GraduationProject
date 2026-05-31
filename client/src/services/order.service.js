import API from "@/api/API";

export const orderService = {

  getAll: () => 
    API.get(`/api/management/orders`),

  confirmOrder: (id) => {
    return API.put(`/api/management/orders/${id}/confirm`);
  },

  packOrder: (id, payload ) => {
    console.log(payload);
    return API.put(`/api/management/orders/${id}/pack`, payload);
  },
 cancelOrder: (code, reason) => {
    return API.post(`/api/management/orders/${code}/cancel?reason=${encodeURIComponent(reason)}`);
  },

  downloadInvoice: (orderId) => {
    return API.get(`/api/management/orders/export-vat/${orderId}`, { responseType: 'blob' });
  },

  //CLIENT
  placeOrder: (payload) => {
    const sessionId = localStorage.getItem('CART_SESSION_ID') || '';
    return API.post('/api/public/orders/checkout', payload, {
      headers: {
        'X-Session-Id': sessionId
      }
    });
  },

  getMyOrders: (params) => API.get('/api/user/orders', { params }),

  getOrderDetail: (orderId) => API.get(`/api/user/orders/${orderId}`),

  cancelOrderByUser: (code, reason) => API.post(`/api/user/orders/${code}/cancel`, null, { params: { reason } }),
  
};