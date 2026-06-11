import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/services/cart.service';
import { toast } from 'react-toastify';

export const cartKeys = {
  all: ['cart'],
};

// 1. Hook LẤY giỏ hàng
export const useGetCart = () => {
  return useQuery({
    queryKey: cartKeys.all,
    queryFn: async () => {
      const res = await cartService.getCart();
      console.log(res.data?.data);
      return res.data?.data; 
    }
  });
};

// 2. Hook THÊM vào giỏ hàng
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => cartService.addToCart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      toast.success("Đã thêm vào giỏ hàng!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.messages || "Thêm thất bại!");
    }
  });
};

export const useUpdateCartQuantity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cartService.updateQuantity,
    onSuccess: () => {
      // Refresh lại data giỏ hàng sau khi update thành công
      queryClient.invalidateQueries(['cart']);
    }
  });
};

export const useDeleteCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cartItemId) => cartService.deleteCartItem(cartItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      toast.success("Xóa giỏ hàng thành công!");
    }
  });
};