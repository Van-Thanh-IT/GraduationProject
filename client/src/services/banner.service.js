import API from '@/api/API';

const bannerService = {
  // GET danh sách banner
  async getBanners(page, size) {
    const res = await API.get(`/api/admin/banners?page=${page}&size=${size}`);
    return res.data.data;
  },

  // CREATE
  async createBanner(formData) {
    const res = await API.post('/api/admin/banners', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // UPDATE
  async updateBanner(id, formData) {
    const res = await API.put(`/api/admin/banners/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // DELETE
  async deleteBanner(id) {
    const res = await API.delete(`/api/admin/banners/${id}`);
    return res.data;
  },
};

export default bannerService;