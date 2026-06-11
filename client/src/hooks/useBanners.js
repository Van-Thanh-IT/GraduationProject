// File: src/hooks/useBanners.js
import { useQuery } from '@tanstack/react-query';
import API from '@/api/API'; 

export const useGetBanners = (placement = 'HOME_MAIN_SLIDER') => {
  return useQuery({
    queryKey: ['banners', placement],
    queryFn: async () => {
      // Gọi API với tham số placement
      const response = await API.get('/api/public/banners', {
        params: { placement }
      });
      return response.data.data;
    },
    keepPreviousData: true,
  });
};