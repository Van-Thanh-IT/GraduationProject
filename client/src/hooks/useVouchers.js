import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { voucherService } from '@/services/voucher.service';
import { message } from 'antd';
export const voucherKeys = {
  all: ['vouchers'],
  available: ['vouchers-available'],
};

export const useGetVouchers = () => {
  return useQuery({
    queryKey: voucherKeys.all,
    queryFn: async () => {
      const res = await voucherService.getAll();
      let data = res.data?.data || res.data || [];
      if (Array.isArray(data)) return [...data].sort((a, b) => b.id - a.id);
      return [];
    },
  });
};

export const useSaveVoucher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => 
      id ? voucherService.update(id, data) : voucherService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.all });
    },
  });
};


export const useDeleteVoucher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => voucherService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.all });
    },
  });
};


//CLIENT
// Hook lấy danh sách Voucher khả dụng
export const useGetAvailableVouchers = () => {
  return useQuery({
    queryKey: voucherKeys.available,
    queryFn: async () => {
      const res = await voucherService.getAvailableVouchers();
      return res.data?.data || [];
    },
  });
};

// Hook để kiểm tra (Preview) mã giảm giá
export const usePreviewDiscount = () => {
  return useMutation({
    mutationFn: ({ code, orderTotal }) => 
      voucherService.previewDiscount(code, orderTotal),
    onSuccess: (res) => {
      // Backend của bạn trả về APIResponse, ta cần kiểm tra code bên trong
      if (res.data?.code === 200) {
        message.success(`Áp dụng mã ${res.data.data.appliedCode} thành công!`);
      } else {
        message.error(res.data?.messages || "Mã không hợp lệ");
      }
    },
    onError: (error) => {
      // Bắt lỗi 400 từ khối try-catch trong Controller
      const errorMsg = error.response?.data?.messages || "Lỗi hệ thống khi áp dụng voucher";
      message.error(errorMsg);
    }
  });
};