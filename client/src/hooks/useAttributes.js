import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AttributeService } from '@/services/attribute.service';

export const attributeKeys = {
  all: ['attributes'],
};

// Lấy danh sách thuộc tính
export const useGetAttributes = () => {
  return useQuery({
    queryKey: attributeKeys.all,
    queryFn: async () => {
      const res = await AttributeService.getAllAttributes();
      let data = res.data?.data || res.data || [];
      if (Array.isArray(data)) return [...data].sort((a, b) => b.id - a.id);
      return [];
    },
  });
};

// Thêm/Sửa thuộc tính
export const useSaveAttribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => 
      id ? AttributeService.updateAttribute(id, formData) : AttributeService.createAttribute(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attributeKeys.all });
    },
  });
};

// Cập nhật trạng thái
export const useUpdateAttributeStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => AttributeService.updateAttributeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attributeKeys.all });
    },
  });
};