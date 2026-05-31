import { useQuery, useMutation } from '@tanstack/react-query';
import { goshipService } from '@/services/goship.service';

export const useGetCities = () => {
  return useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const res = await goshipService.getCities();
      return res.data?.data || [];
    },
    staleTime: Infinity, // Tỉnh thành ít khi thay đổi, cache luôn
  });
};

export const useGetDistricts = (cityCode) => {
  return useQuery({
    queryKey: ['districts', cityCode],
    queryFn: async () => {
      const res = await goshipService.getDistricts(cityCode);
      return res.data?.data || [];
    },
    enabled: !!cityCode,
  });
};

export const useGetWards = (districtCode) => {
  return useQuery({
    queryKey: ['wards', districtCode],
    queryFn: async () => {
      const res = await goshipService.getWards(districtCode);
      return res.data?.data || [];
    },
    enabled: !!districtCode,
  });
};

export const useCalculateFee = () => {
  return useMutation({
    mutationFn: (payload) => goshipService.calculateFee(payload),
  });
};