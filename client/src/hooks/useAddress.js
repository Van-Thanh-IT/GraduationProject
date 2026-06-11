// File: src/hooks/useAddress.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AddressService } from '@/services/address.service';
import { goshipService } from '@/services/goship.service'; 
import { toast } from 'react-toastify';

export const useGetMyAddresses = () => {
  return useQuery({
    queryKey: ['my-addresses'],
    queryFn: () => AddressService.getMyAddresses().then(res => res.data.data),
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => AddressService.createAddress(data),
    onSuccess: () => {
      toast.success('Thêm địa chỉ thành công');
      queryClient.invalidateQueries({ queryKey: ['my-addresses'] });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => AddressService.updateAddress(id, data),
    onSuccess: () => {
      toast.success('Cập nhật địa chỉ thành công');
      queryClient.invalidateQueries({ queryKey: ['my-addresses'] });
    },
    onError: (err) => toast.error(err.response?.data?.messages || 'Không thể bỏ địa chỉ mặc định. Hãy chọn địa chỉ khác trước'),
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => AddressService.deleteAddress(id),
    onSuccess: () => {
      toast.success('Đã xóa địa chỉ');
      queryClient.invalidateQueries({ queryKey: ['my-addresses'] });
    },
  });
};

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => AddressService.setDefaultAddress(id),
    onSuccess: () => {
      toast.success('Đã đặt làm địa chỉ mặc định');
      queryClient.invalidateQueries({ queryKey: ['my-addresses'] });
    },
  });
};

export const useGetCities = () => {
  return useQuery({
    queryKey: ['goship-cities'],
    queryFn: () => goshipService.getCities().then(res => res.data.data),
    staleTime: Infinity, // cache 
  });
};

export const useGetDistricts = (cityCode) => {
  return useQuery({
    queryKey: ['goship-districts', cityCode],
    queryFn: () => goshipService.getDistricts(cityCode).then(res => res.data.data),
    enabled: !!cityCode, 
    staleTime: Infinity,
  });
};

export const useGetWards = (districtCode) => {
  return useQuery({
    queryKey: ['goship-wards', districtCode],
    queryFn: () => goshipService.getWards(districtCode).then(res => res.data.data),
    enabled: !!districtCode,
    staleTime: Infinity,
  });
};