import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import API from '@/api/API'; // File cấu hình axios của bạn

export const useAdminBanners = (page = 0, size = 10) => {
  const queryClient = useQueryClient();

  // 1. Lấy danh sách (GET)
  const getBanners = useQuery({
    queryKey: ['admin-banners', page, size],
    queryFn: async () => {
      const { data } = await API.get(`/admin/banners?page=${page}&size=${size}`);
      return data.data; // Trả về Page<BannerResponse>
    },
    keepPreviousData: true,
  });

  // 2. Thêm mới (POST)
  const createBanner = useMutation({
    mutationFn: async (formData) => {
      // Dùng Content-Type: multipart/form-data
      const { data } = await API.post('/admin/banners', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      message.success('Thêm banner thành công!');
      queryClient.invalidateQueries(['admin-banners']);
    },
    onError: (err) => message.error(err.response?.data?.message || 'Lỗi khi thêm banner'),
  });

  // 3. Cập nhật (PUT)
  const updateBanner = useMutation({
    mutationFn: async ({ id, formData }) => {
      const { data } = await API.put(`/admin/banners/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      message.success('Cập nhật banner thành công!');
      queryClient.invalidateQueries(['admin-banners']);
    },
    onError: (err) => message.error(err.response?.data?.message || 'Lỗi khi cập nhật banner'),
  });

  // 4. Xóa (DELETE)
  const deleteBanner = useMutation({
    mutationFn: async (id) => {
      await API.delete(`/admin/banners/${id}`);
    },
    onSuccess: () => {
      message.success('Xóa banner thành công!');
      queryClient.invalidateQueries(['admin-banners']);
    },
  });

  return { getBanners, createBanner, updateBanner, deleteBanner };
};