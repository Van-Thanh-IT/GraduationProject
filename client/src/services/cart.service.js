import API from '@/api/API'; // File cấu hình axios của bạn

// Hàm tự động tạo và lấy Session ID cho khách vãng lai
const getCartSessionId = () => {
  let sessionId = localStorage.getItem('CART_SESSION_ID');
  if (!sessionId) {
    // Tạo 1 chuỗi ngẫu nhiên (VD: cart_1701234567890_abc123)
    sessionId = 'cart_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('CART_SESSION_ID', sessionId);
  }
  return sessionId;
};

// Đính kèm Session ID vào Header của mọi request Cart
const getHeaders = () => ({
  'X-Session-Id': getCartSessionId()
});

export const cartService = {
  // Lấy giỏ hàng
  getCart: () => API.get('/api/public/cart', { headers: getHeaders() }),
  
  // Thêm vào giỏ (request: { productVariantId: 3, quantity: 2 })
  addToCart: (data) => API.post('/api/public/cart/items', data, { headers: getHeaders() }),

  updateQuantity: ({ cartItemId, quantity }) => 
    API.put(`/api/public/cart/items/${cartItemId}`, { quantity }, { headers: getHeaders() }),
  
  // Đồng bộ giỏ hàng (Gọi ngay sau khi gọi API Login thành công)
  mergeCart: () => API.post('/public/cart/merge', null, { headers: getHeaders() }),
  
  // Xóa 1 item trong giỏ
  deleteCartItem: (cartItemId) => API.delete(`/api/public/cart/items/${cartItemId}`, { headers: getHeaders() })
};