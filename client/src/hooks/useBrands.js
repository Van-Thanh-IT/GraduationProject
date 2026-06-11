import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BrandService } from '@/services/brand.service';

export const brandKeys = {
  all: ['brands'],
  list: (keyword) => [...brandKeys.all, 'list', { keyword }],
};

// Hook lấy danh sách
export const useGetBrands = () => {
  return useQuery({
    queryKey: brandKeys.all,
    queryFn: async () => {
      const res = await BrandService.getAllBrands();
      let data = res.data?.data || res.data || [];
      if (Array.isArray(data)) return [...data].sort((a, b) => b.id - a.id);
      return [];
    },
  });
};

// Hook Thêm/Sửa thương hiệu
export const useSaveBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => 
      id ? BrandService.updateBrand(id, formData) : BrandService.createBrand(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
    },
  });
};

// Hook Cập nhật trạng thái
export const useUpdateBrandStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => BrandService.updateBrandStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
    },
  });
};