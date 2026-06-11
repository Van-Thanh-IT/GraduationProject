import { useQuery } from '@tanstack/react-query';
import API from '@/api/API'; 

export const useGetDashboard = ({startDate, endDate} = {}) => {
  return useQuery({
    queryKey: ['dashboard', startDate, endDate],

    queryFn: async () => {
      const params = {
        startDate,
        endDate,
      };

      const res = await API.get('/api/management/dashboard', {
        params,
      });


      return res.data?.data;
    },

    refetchInterval: 60000,
  });
};