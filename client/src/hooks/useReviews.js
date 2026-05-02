// File: src/hooks/useAdminReviews.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '@/api/API';
import { message } from 'antd';

// 1. Hook lấy danh sách đánh giá
export const useGetAdminReviews = (filters) => {
  return useQuery({
    queryKey: ['admin-reviews', filters],
    queryFn: async () => {
      // Chuyển đổi page cho Spring Boot (Backend bắt đầu từ 0, Frontend từ 1)
      const params = {
        ...filters,
        page: filters.page - 1,
      };
      
      // Xóa các key null/undefined hoặc chuỗi rỗng để URL sạch hơn
      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });

      const response = await API.get('/admin/reviews', { params });
      return response.data.data; // Trả về object chứa content, totalElements...
    },
    keepPreviousData: true, // Giúp UI không bị giật chớp khi chuyển trang
  });
};

// 2. Hook cập nhật trạng thái (Duyệt / Ẩn)
export const useUpdateReviewStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await API.put(`/admin/reviews/${id}/status`, null, { 
        params: { status } 
      });
      return response.data;
    },
    onSuccess: () => {
      // Refresh lại danh sách ngay lập tức sau khi cập nhật thành công
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    }
  });
};

// 3. Hook xóa đánh giá
export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await API.delete(`/admin/reviews/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    }
  });
};

// CLIENT

// hàm chờ đánh giá
export const useGetAwaitingReviews = () => {
  return useQuery({
    queryKey: ['awaiting-reviews'],
    queryFn: async () => {
      const response = await API.get('/user/reviews/awaiting');
      return response.data.data; // Trả về List<AwaitingReviewResponse>
    }
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData) => {
      // Quan trọng: Phải truyền formData (multipart/form-data) cho upload ảnh
      const response = await API.post('/user/reviews', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      message.success("Đánh giá của bạn đã được gửi thành công!");
      // Tải lại danh sách "Chờ đánh giá" để sản phẩm vừa review biến mất
      queryClient.invalidateQueries({ queryKey: ['awaiting-reviews'] });
      // Cũng nên tải lại lịch sử mua hàng phòng khi người dùng quay lại tab Tất cả
      queryClient.invalidateQueries({ queryKey: ['my-orders'] }); 
    },
    onError: (error) => {
      message.error(error.response?.data?.messages || "Đã xảy ra lỗi khi gửi đánh giá!");
    }
  });
};

export const useGetProductReviewSummary = (productId) => {
  return useQuery({
    queryKey: ['product-review-summary', productId],
    queryFn: async () => {
      const response = await API.get(`/public/products/${productId}/reviews/summary`);
      return response.data.data;
    },
    enabled: !!productId, // Chỉ gọi API khi đã có ID sản phẩm
  });
};


// Lấy danh sách đánh giá của 1 sản phẩm cụ thể
export const useGetProductReviews = (productId, rating) => {
  return useQuery({
    queryKey: ['product-reviews', productId, rating],
    queryFn: async () => {
      const params = {};
      if (rating) params.rating = rating;
      
      const response = await API.get(`/public/products/${productId}/reviews`, { params });
      return response.data.data; // Trả về mảng các đánh giá
    },
    enabled: !!productId, // Đảm bảo chỉ gọi API khi đã có productId
    keepPreviousData: true,
  });
};