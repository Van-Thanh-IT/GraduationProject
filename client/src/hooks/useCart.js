import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/services/cart.service';
import { message } from 'antd';

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
      message.success("Đã thêm vào giỏ hàng!");
    },
    onError: (error) => {
      message.error(error.response?.data?.messages || "Thêm thất bại!");
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

// 3. Hook XÓA item khỏi giỏ
export const useDeleteCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cartItemId) => cartService.deleteCartItem(cartItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      message.success("Đã xóa sản phẩm!");
    }
  });
};