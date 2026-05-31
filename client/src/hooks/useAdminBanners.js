import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import bannerService from '@/services/banner.service';

export const useAdminBanners = (page = 0, size = 10) => {
  const queryClient = useQueryClient();

  // GET
  const getBanners = useQuery({
    queryKey: ['admin-banners', page, size],
    queryFn: () => bannerService.getBanners(page, size),
    keepPreviousData: true,
  });

  // CREATE
  const createBanner = useMutation({
    mutationFn: bannerService.createBanner,
    onSuccess: () => {
      toast.success('Thêm banner thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || 'Lỗi khi thêm banner'),
  });

  // UPDATE
  const updateBanner = useMutation({
    mutationFn: ({ id, formData }) =>
      bannerService.updateBanner(id, formData),
    onSuccess: () => {
      toast.success('Cập nhật banner thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật banner'),
  });

  // DELETE
  const deleteBanner = useMutation({
    mutationFn: bannerService.deleteBanner,
    onSuccess: () => {
      toast.success('Xóa banner thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
    },
  });

  return { getBanners, createBanner, updateBanner, deleteBanner };
};