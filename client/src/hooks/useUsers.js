import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '@/services/user.service'; // Chỉnh lại đường dẫn nếu cần

export const userKeys = {
  all: ['users'],
  list: (role) => [...userKeys.all, 'list', { role }],
};

export const useGetUsers = (role) => {
  return useQuery({
    queryKey: userKeys.list(role),
    queryFn: async () => {
      const res = await UserService.getUsers(role);
      let data = res.data?.data || res.data || [];
      if (Array.isArray(data)) {
        return [...data].sort((a, b) => b.id - a.id);
      }
      return data;
    },
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => UserService.createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, status }) => UserService.updateStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};