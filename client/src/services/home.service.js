import API from '@/api/API'; // File cấu hình axios của bạn

export const homeService = {
  getHomeProducts: () => API.get('public/home'),
  lookup: (keyword) => API.get('/public/warranty/lookup', { params: { keyword } }),
};