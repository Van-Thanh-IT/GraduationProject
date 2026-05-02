import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CategoryService } from '@/services/category.service';

export const categoryKeys = {
  all: ['categories'],
};

// Hook lấy danh sách danh mục
export const useGetCategories = () => {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: async () => {
      const res = await CategoryService.getAllCategories();
      let data = res.data?.data || res.data || [];
      if (Array.isArray(data)) return [...data].sort((a, b) => b.id - a.id);
      return [];
    },
  });
};

// Hook Thêm/Sửa danh mục
export const useSaveCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => 
      id ? CategoryService.updateCategory(id, formData) : CategoryService.createCategory(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
};

// Hook Cập nhật trạng thái (ACTIVE/INACTIVE)
export const useUpdateCategoryStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => CategoryService.updateCategoryStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
};