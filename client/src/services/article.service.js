import API from "@/api/API";

const ArticleService = {
  getArticles: (page, size) => {
    return API.get(`/api/management/articles?page=${page}&size=${size}`);
  },

  createArticle: (formData) => {
    return API.post('/api/management/articles', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateArticle: (id, formData) => {
    return API.put(`/api/management/articles/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteArticle: (id) => {
    return API.delete(`/api/management/articles/${id}`);
  },

   //CLIENT
  getClientArticles: (page, size) => {
    return API.get(`/api/public/articles?page=${page}&size=${size}`);
  },

  getClientArticleDetail: (slug) => {
    return API.get(`/api/public/articles/${slug}`);
  },
};

export default ArticleService;