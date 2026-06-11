import API from '@/api/API'; // File cấu hình axios của bạn

export const homeService = {
  getHomeProducts: () => API.get('/api/public/home'),
  lookup: (keyword) => API.get('/api/public/warranty/lookup', { params: { keyword } }),
};