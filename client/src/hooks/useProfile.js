// File: src/hooks/useProfile.js
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import API from '@/api/API';

export const useGetProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => API.get('/api/profile/me').then(res => res.data.data),
  });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, formData }) => {
      return API.put(`/api/profile/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () =>{
        queryClient.invalidateQueries({ queryKey: ['auth-user'] });
        queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
    
  });
};