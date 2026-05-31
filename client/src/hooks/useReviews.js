import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import reviewService from '@/services/reviews.service';
import { toast } from 'react-toastify';

// ADMIN
export const useGetAdminReviews = (filters) => {
  return useQuery({
    queryKey: ['admin-reviews', filters],
    queryFn: () => reviewService.getAdminReviews(filters),
    keepPreviousData: true,
  });
};

export const useUpdateReviewStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewService.updateReviewStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewService.deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
  });
};

// CLIENT
export const useGetAwaitingReviews = () => {
  return useQuery({
    queryKey: ['awaiting-reviews'],
    queryFn: reviewService.getAwaitingReviews,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewService.createReview,
    onSuccess: () => {
      toast.success("Đánh giá thành công!");
      queryClient.invalidateQueries({ queryKey: ['awaiting-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.messages || "Lỗi!");
    },
  });
};

// PUBLIC
export const useGetProductReviewSummary = (productId) => {
  return useQuery({
    queryKey: ['product-review-summary', productId],
    queryFn: () => reviewService.getProductReviewSummary(productId),
    enabled: !!productId,
  });
};

export const useGetProductReviews = (productId, rating) => {
  return useQuery({
    queryKey: ['product-reviews', productId, rating],
    queryFn: () => reviewService.getProductReviews(productId, rating),
    enabled: !!productId,
    keepPreviousData: true,
  });
};