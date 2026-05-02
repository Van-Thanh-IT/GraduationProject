import { useQuery, useMutation } from '@tanstack/react-query';
import { homeService } from '@/services/home.service';

export const homeKeys = {
  // Quản lý key tập trung
  data: ['home-data'],
};

// Đổi tên thành useGetHomeData sẽ hợp lý hơn vì nó không chỉ chứa mỗi Products (còn có Categories)
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
    // Quan trọng: Vì là trang chủ, lượng truy cập rất lớn, 
    // ta nên cache lại dữ liệu trong 5 phút để giảm tải cho Backend.
    staleTime: 5 * 60 * 1000, 
    
    // Tùy chọn: Không tự động gọi lại API khi người dùng chuyển tab trình duyệt
    refetchOnWindowFocus: false, 
  });
};


// 2. Hook
export const useWarrantyLookup = () => {
  return useMutation({
    mutationFn: (keyword) => homeService.lookup(keyword).then(res => res.data.data),
  });
};