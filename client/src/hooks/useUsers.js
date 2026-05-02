import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '@/services/user.service'; // Chỉnh lại đường dẫn nếu cần

// 1. Quản lý Query Keys tập trung
export const userKeys = {
  all: ['users'],
  // Phân tách cache theo role (để khi chuyển tab giữa STAFF và CUSTOMER không bị load lại data cũ)
  list: (role) => [...userKeys.all, 'list', { role }],
};

// ==========================================
// 2. HOOK LẤY DANH SÁCH (CÓ THỂ LỌC THEO ROLE)
// ==========================================
export const useGetUsers = (role) => {
  return useQuery({
    // Nếu role undefined, key sẽ là ['users', 'list', { role: undefined }]
    queryKey: userKeys.list(role),
    queryFn: async () => {
      const res = await UserService.getUsers(role);
      let data = res.data?.data || res.data || [];
      // Sắp xếp user mới nhất lên đầu (nếu data là mảng)
      if (Array.isArray(data)) {
        return [...data].sort((a, b) => b.id - a.id);
      }
      return data;
    },
  });
};

// ==========================================
// 3. HOOK TẠO TÀI KHOẢN NHÂN VIÊN
// ==========================================
export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    // Data truyền vào là một Object bình thường, UserService sẽ tự map ra FormData
    mutationFn: (data) => UserService.createStaff(data),
    onSuccess: () => {
      // Refresh lại toàn bộ danh sách users sau khi thêm thành công
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

// ==========================================
// 4. HOOK CẬP NHẬT TRẠNG THÁI TÀI KHOẢN
// ==========================================
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    // Nhận vào object chứa userId và status
    mutationFn: ({ userId, status }) => UserService.updateStatus(userId, status),
    onSuccess: () => {
      // Refresh lại danh sách để UI hiển thị trạng thái mới nhất
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};