import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';

export const orderKeys = {
  all: ['orders'],
  detail: (id) => [...orderKeys.all, id],
};

export const useGetOrders = () => {
  return useQuery({
    queryKey: orderKeys.all,
    queryFn: async () => {
      const res = await orderService.getAll();
      let data = res.data?.data || res.data || [];
      return data;
    },
  });
};

export const useConfirmOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => orderService.confirmOrder(id),
    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
    onError: () => {
      toast.error("Xác nhận thất bại!");
    }
  });
};

export const usePackOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => orderService.packOrder(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code, reason }) => orderService.cancelOrder(code, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
   
  });
};

//CLIENT
export const usePlaceOrder = () => {
  const { isAuthenticated } = useAuth();
  
  return useMutation({
    mutationFn: orderService.placeOrder,
    onSuccess: (res) => {
      if (res.data?.code === 200 || res.data?.code === "00") {
        const responseData = res.data.data;

        if (responseData?.paymentUrl) {
          toast.info("Đang chuyển hướng sang VNPAY...");
          setTimeout(() => {
            window.location.href = responseData.paymentUrl;
          }, 1000);
        } else {
          setTimeout(() => {
            if(isAuthenticated){
              window.location.href = '/user/orders';
            }
            else{
              window.location.href = '/';
            }
           
          }, 500);
           toast.success("Đặt hàng thành công!");
        }
      } else {
        toast.error(res.data?.messages || "Có lỗi xảy ra khi đặt hàng.");
      }
    },
    onError: (error) => {
      const errorMsg =
        error.response?.data?.messages ||
        "Lỗi hệ thống, vui lòng thử lại sau.";
      toast.error(errorMsg);
    }
  });
};


export const useGetMyOrders = (filters) => {
  return useQuery({
    // queryKey chứa cả filters, nên hễ filters (page, status, keyword) đổi -> tự động gọi lại API
    queryKey: ['my-orders', filters],
    queryFn: () => orderService.getMyOrders(filters).then(res => res.data.data),
    keepPreviousData: true, // Giữ data cũ mượt mà trong lúc chuyển trang (không bị chớp trắng)
  });
};

export const useGetOrderDetail = (orderId) => {
  return useQuery({
    queryKey: ['order-detail', orderId],
    queryFn: () => orderService.getOrderDetail(orderId).then(res => res.data.data),
    enabled: !!orderId,
  });
};

export const useCancelOrderByUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ code, reason }) => orderService.cancelOrderByUser(code, reason),
    onSuccess: () => {
      // Ép load lại cả danh sách đơn hàng VÀ chi tiết đơn hàng để UI cập nhật ngay lập tức
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-detail'] });
    }
  });
};