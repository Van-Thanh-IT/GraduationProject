import API from "@/api/API";

export const orderService = {

  getAll: () => 
    API.get(`/management/orders`),

  confirmOrder: (id) => {
    return API.put(`/management/orders/${id}/confirm`);
  },

  packOrder: (id, payload ) => {
    return API.put(`/management/orders/${id}/pack`, payload);
  },
 cancelOrder: (code, reason) => {
    return API.post(`/management/orders/${code}/cancel?reason=${encodeURIComponent(reason)}`);
  },

  downloadInvoice: (orderId) => {
    return API.get(`/management/orders/export-vat/${orderId}`, { responseType: 'blob' });
  },

  //CLIENT
  placeOrder: (payload) => {
    const sessionId = localStorage.getItem('CART_SESSION_ID') || '';
    return API.post('/public/orders/checkout', payload, {
      headers: {
        'X-Session-Id': sessionId
      }
    });
  },

  getMyOrders: (params) => API.get('/user/orders', { params }),

  getOrderDetail: (orderId) => API.get(`/user/orders/${orderId}`),

  cancelOrderByUser: (code, reason) => API.post(`/user/orders/${code}/cancel`, null, { params: { reason } }),
  
};