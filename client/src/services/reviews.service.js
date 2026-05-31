import API from '@/api/API';

const reviewService = {

  // ================= ADMIN =================
  async getAdminReviews(filters) {
    const params = {
      ...filters,
      page: filters.page - 1,
    };

    Object.keys(params).forEach((key) => {
      if (params[key] == null || params[key] === '') {
        delete params[key];
      }
    });

    const res = await API.get('/api/admin/reviews', { params });
    return res.data.data;
  },

  async updateReviewStatus({ id, status }) {
    const res = await API.put(`/api/admin/reviews/${id}/status`, null, {
      params: { status },
    });
    return res.data;
  },

  async deleteReview(id) {
    const res = await API.delete(`/api/admin/reviews/${id}`);
    return res.data;
  },

  // ================= USER =================
  async getAwaitingReviews() {
    const res = await API.get('/api/user/reviews/awaiting');
    return res.data.data;
  },

  async createReview(formData) {
    const res = await API.post('/api/user/reviews', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // ================= PUBLIC =================
  async getProductReviewSummary(productId) {
    const res = await API.get(`/api/public/products/${productId}/reviews/summary`);
    return res.data.data;
  },

  async getProductReviews(productId, rating) {
    const params = {};
    if (rating) params.rating = rating;

    const res = await API.get(`/api/public/products/${productId}/reviews`, { params });
    return res.data.data;
  },
};

export default reviewService;