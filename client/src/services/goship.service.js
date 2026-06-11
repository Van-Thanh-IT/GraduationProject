import API from '@/api/API'; 

export const goshipService = {
  // 1. Lấy danh sách Tỉnh/Thành
  getCities: () => API.get('/api/public/goship/cities'),
  
  // 2. Lấy Quận/Huyện theo Tỉnh
  getDistricts: (cityCode) => API.get(`/api/public/goship/cities/${cityCode}/districts`),
  
  // 3. Lấy Phường/Xã theo Huyện
  getWards: (districtCode) => API.get(`/api/public/goship/districts/${districtCode}/wards`),
  
  // 4. Tính phí ship (Truyền vào city, district, ward, cod, amount, weight)
  calculateFee: (payload) => API.post('/api/public/goship/calculate-fee', payload)
};