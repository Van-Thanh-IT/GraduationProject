/**
 * Định dạng số thành tiền tệ VNĐ (Có chữ ₫ ở cuối)
 * Phù hợp để HIỂN THỊ ở bảng (Table), chi tiết sản phẩm...
 * VD: 3000000 -> "3.000.000 ₫"
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || amount === '') return '0 ₫';
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Định dạng số chuẩn VN (Chỉ có dấu chấm, KHÔNG có chữ ₫)
 * Phù hợp để làm VALUE TRONG Ô INPUT
 * VD: 3000000 -> "3.000.000"
 */
export const formatNumber = (number) => {
  if (number === undefined || number === null || number === '') return '';

  const numericValue = Number(number);
  if (isNaN(numericValue)) return '';

  return new Intl.NumberFormat('en-US').format(numericValue);
};
/**
 * Xóa bỏ mọi định dạng (dấu chấm, phẩy, chữ) để lấy số gốc
 * Phù hợp để LƯU VÀO STATE và GỬI LÊN BACKEND
 * VD: "3.000.000 ₫" hoặc "3.000.000" -> "3000000"
 */
export const parseNumber = (formattedString) => {
  if (!formattedString) return '';
  // Giữ lại số và dấu trừ (nếu có số âm)
  return formattedString.toString().replace(/[^\d-]/g, '');
};

