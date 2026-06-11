import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24,

      refetchOnWindowFocus: false,
      refetchOnMount: false,          // 🔥 thêm cái này
      refetchOnReconnect: false,      // 🔥 thêm cái này

      keepPreviousData: true,         // 🔥 mượt UI
    },

    mutations: {
      onError: (error) => {
        const backendError = error.response?.data;
        console.error("DEBUG BACKEND ERROR:", backendError);
      },
    },
  },
});