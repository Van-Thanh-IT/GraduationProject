// File: src/hooks/useAddress.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AddressService } from '@/services/address.service';
import { goshipService } from '@/services/goship.service'; // File chứa goshipService bạn đã gửi
import { message } from 'antd';

// ==========================================
// 1. HOOKS QUẢN LÝ ĐỊA CHỈ (BACKEND CỦA BẠN)
// ==========================================
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
      message.success('Thêm địa chỉ thành công');
      queryClient.invalidateQueries({ queryKey: ['my-addresses'] });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => AddressService.updateAddress(id, data),
    onSuccess: () => {
      message.success('Cập nhật địa chỉ thành công');
      queryClient.invalidateQueries({ queryKey: ['my-addresses'] });
    },
    onError: (err) => message.error(err.response?.data?.messages || 'Không thể bỏ địa chỉ mặc định. Hãy chọn địa chỉ khác trước'),
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => AddressService.deleteAddress(id),
    onSuccess: () => {
      message.success('Đã xóa địa chỉ');
      queryClient.invalidateQueries({ queryKey: ['my-addresses'] });
    },
  });
};

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => AddressService.setDefaultAddress(id),
    onSuccess: () => {
      message.success('Đã đặt làm địa chỉ mặc định');
      queryClient.invalidateQueries({ queryKey: ['my-addresses'] });
    },
  });
};

// ==========================================
// 2. HOOKS LẤY DỮ LIỆU TỈNH THÀNH (GOSHIP)
// ==========================================
export const useGetCities = () => {
  return useQuery({
    queryKey: ['goship-cities'],
    queryFn: () => goshipService.getCities().then(res => res.data.data),
    staleTime: Infinity, // Tỉnh thành ít khi đổi, cache luôn
  });
};

export const useGetDistricts = (cityCode) => {
  return useQuery({
    queryKey: ['goship-districts', cityCode],
    queryFn: () => goshipService.getDistricts(cityCode).then(res => res.data.data),
    enabled: !!cityCode, // Chỉ gọi API khi đã có mã Tỉnh
    staleTime: Infinity,
  });
};

export const useGetWards = (districtCode) => {
  return useQuery({
    queryKey: ['goship-wards', districtCode],
    queryFn: () => goshipService.getWards(districtCode).then(res => res.data.data),
    enabled: !!districtCode, // Chỉ gọi API khi đã có mã Huyện
    staleTime: Infinity,
  });
};