import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { flashSaleService } from '@/services/flashSale.service';

export const flashSaleKeys = {
  all: ['flashSales'],
};

// Hook lấy danh sách
export const useGetFlashSales = () => {
  return useQuery({
    queryKey: flashSaleKeys.all,
    queryFn: async () => {
      const res = await flashSaleService.getAll();
      return res.data.data || [];
    },
    refetchInterval: 60000, 
  });
};

// Hook Thêm/Sửa
export const useSaveFlashSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => 
      id ? flashSaleService.update(id, data) : flashSaleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: flashSaleKeys.all });
    },
  });
};

// Hook Bật/Tắt nhanh status
export const useToggleFlashSaleStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => flashSaleService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: flashSaleKeys.all });
    },
  });
};