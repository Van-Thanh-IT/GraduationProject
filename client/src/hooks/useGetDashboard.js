import { useQuery } from '@tanstack/react-query';
import API from '@/api/API'; // File cấu hình axios của bạn

export const useGetDashboard = () => {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await API.get('/management/dashboard');
      // Trả về thẳng block "data" trong JSON của bạn
      return res.data?.data || {}; 
    },
    refetchInterval: 60000, 
  });
};