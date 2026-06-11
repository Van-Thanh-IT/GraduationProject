
import API from '@/api/API';

export const pdfService = {
  // 1. PDF Đơn hàng
  downloadOrderVat: (orderId) => {
    return API.get(`/api/admin/orders/export-vat/${orderId}`, {
      responseType: 'arraybuffer' 
    });
  },
  
  downloadDeliveryNotes: (codes) => {
    // Nối mảng codes thành string cách nhau bởi dấu phẩy, VD: ?codes=ORD1,ORD2
    const codesParams = codes.join(',');
    return API.get(`/api/admin/orders/export-delivery-notes`, {
      params: { codes: codesParams },
      responseType: 'arraybuffer'
    });
  },
};