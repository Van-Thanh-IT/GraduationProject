
import API from '@/api/API';

export const pdfService = {
  // 1. PDF Đơn hàng
  downloadOrderVat: (orderId) => {
    return API.get(`/admin/orders/export-vat/${orderId}`, {
      responseType: 'arraybuffer' 
    });
  },
  
  downloadDeliveryNotes: (codes) => {
    // Nối mảng codes thành string cách nhau bởi dấu phẩy, VD: ?codes=ORD1,ORD2
    const codesParams = codes.join(',');
    return API.get(`/admin/orders/export-delivery-notes`, {
      params: { codes: codesParams },
      responseType: 'arraybuffer'
    });
  },

//   // 2. PDF Sản phẩm (Ví dụ sau này dùng)
//   downloadProductBarcode: (productId) => {
//     return API.get(`/admin/products/export-barcode/${productId}`, {
//       responseType: 'arraybuffer'
//     });
//   },

//   // 3. PDF Tồn kho (Ví dụ sau này dùng)
//   downloadInventoryReport: (month, year) => {
//     return API.get(`/admin/inventory/export-report`, {
//       params: { month, year },
//       responseType: 'arraybuffer'
//     });
//   }
};