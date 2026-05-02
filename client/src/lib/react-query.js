import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Thử lại 1 lần nếu lỗi (mặc định là 3)
      refetchOnWindowFocus: false, // Không tự fetch lại khi chuyển tab
      staleTime: 1000 * 60 * 5, // Dữ liệu được coi là "mới" trong 5 phút
      gcTime: 1000 * 60 * 60 * 24, // Giữ trong bộ nhớ đệm (Garbage Collection) 24h
      throwOnError: false,
    },
   mutations: {
      // Global logic khi có lỗi xảy ra ở bất kỳ lệnh Thêm/Sửa/Xóa nào
      onError: (error) => {
        const backendError = error.response?.data;
        console.error("DEBUG BACKEND ERROR:", backendError); // Hiện trong console để dev xem
      },
    },
  },
});