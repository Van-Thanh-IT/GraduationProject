import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import API from '@/api/API'; // File cấu hình axios của bạn

export const useAdminArticles = (page = 0, size = 10) => {
  const queryClient = useQueryClient();

  // 1. Lấy danh sách bài viết
  const getArticles = useQuery({
    queryKey: ['admin-articles', page, size],
    queryFn: async () => {
      const { data } = await API.get(`/management/articles?page=${page}&size=${size}`);
      return data.data; // Trả về Page<ArticleResponse>
    },
    keepPreviousData: true,
  });

  // 2. Thêm bài viết mới
  const createArticle = useMutation({
    mutationFn: async (formData) => {
      const { data } = await API.post('/management/articles', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      message.success('Thêm bài viết thành công!');
      queryClient.invalidateQueries(['admin-articles']);
    },
    onError: (err) => message.error(err.response?.data?.message || 'Lỗi khi thêm bài viết'),
  });

  // 3. Cập nhật bài viết
  const updateArticle = useMutation({
    mutationFn: async ({ id, formData }) => {
      const { data } = await API.put(`/management/articles/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      message.success('Cập nhật bài viết thành công!');
      queryClient.invalidateQueries(['admin-articles']);
    },
    onError: (err) => message.error(err.response?.data?.message || 'Lỗi khi cập nhật bài viết'),
  });

  // 4. Xóa bài viết
  const deleteArticle = useMutation({
    mutationFn: async (id) => {
      await API.delete(`/management/articles/${id}`);
    },
    onSuccess: () => {
      message.success('Xóa bài viết thành công!');
      queryClient.invalidateQueries(['admin-articles']);
    },
    onError: (err) => message.error(err.response?.data?.message || 'Lỗi khi xóa bài viết'),
  });

  return { getArticles, createArticle, updateArticle, deleteArticle };
};