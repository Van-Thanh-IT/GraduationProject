import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ArticleService from '@/services/article.service';
import { toast } from 'react-toastify';

export const useAdminArticles = (page = 0, size = 10) => {
  const queryClient = useQueryClient();

  // 1. Lấy danh sách
  const getArticles = useQuery({
    queryKey: ['admin-articles', page, size],
    queryFn: async () => {
      const { data } = await ArticleService.getArticles(page, size);
      return data.data;
    },
    keepPreviousData: true,
  });

  // 2. Thêm
  const createArticle = useMutation({
    mutationFn: ArticleService.createArticle,
    onSuccess: () => {
      toast.success('Thêm bài viết thành công!');
      queryClient.invalidateQueries(['admin-articles']);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || 'Lỗi khi thêm bài viết'),
  });

  // 3. Update
  const updateArticle = useMutation({
    mutationFn: ({ id, formData }) =>
      ArticleService.updateArticle(id, formData),
    onSuccess: () => {
      toast.success('Cập nhật bài viết thành công!');
      queryClient.invalidateQueries(['admin-articles']);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật bài viết'),
  });

  // 4. Delete
  const deleteArticle = useMutation({
    mutationFn: ArticleService.deleteArticle,
    onSuccess: () => {
      toast.success('Xóa bài viết thành công!');
      queryClient.invalidateQueries(['admin-articles']);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || 'Lỗi khi xóa bài viết'),
  });

  return { getArticles, createArticle, updateArticle, deleteArticle };
};