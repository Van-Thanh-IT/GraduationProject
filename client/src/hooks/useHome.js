import { useQuery, useMutation } from '@tanstack/react-query';
import { homeService } from '@/services/home.service';

export const homeKeys = {
  // Quản lý key tập trung
  data: ['home-data'],
};

export const useGetHomeData = () => {
  return useQuery({
    queryKey: homeKeys.data,
    queryFn: async () => {
      const res = await homeService.getHomeProducts(); 
      
      return res.data?.data || { 
        categories: [], 
        brands: [],
        flashSale: [],
        bestSellers: [], 
        defaultProducts: [] 
      }; 
    },

    staleTime: 5 * 60 * 1000, 
    
    refetchOnWindowFocus: false, 
  });
};


// 2. Hook
export const useWarrantyLookup = () => {
  return useMutation({
    mutationFn: (keyword) => homeService.lookup(keyword).then(res => res.data.data),
  });
};