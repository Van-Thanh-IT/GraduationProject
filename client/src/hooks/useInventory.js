import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InventoryService } from '@/services/inventory.service'; // Sửa lại đường dẫn import cho đúng dự án của bạn

// 1. Quản lý Query Keys tập trung (Tránh gõ sai string)
export const inventoryKeys = {
  all: ['inventory'],
  
  notes: () => [...inventoryKeys.all, 'notes'],
  noteDetail: (id) => [...inventoryKeys.notes(), id],
  
  // Keys cho Lịch sử
  histories: () => [...inventoryKeys.all, 'history'],
  historyByVariant: (variantId) => [...inventoryKeys.histories(), variantId],
};

export const useGetAllNotes = () => {
  return useQuery({
    queryKey: inventoryKeys.notes(),
    queryFn: async () => {
      const res = await InventoryService.getAllNotes();
      let data = res.data?.data || res.data || [];
      // Sắp xếp ID mới nhất lên đầu (nếu là mảng)
      if (Array.isArray(data)) {
        return [...data].sort((a, b) => b.id - a.id);
      }
      return data;
    },
  });
};


export const useGetNoteById = (id) => {
  return useQuery({
    queryKey: inventoryKeys.noteDetail(id),
    queryFn: async () => {
      const res = await InventoryService.getNoteById(id);
      return res.data?.data || res.data;
    },
    // Chỉ gọi API khi biến id có giá trị (khác null, undefined)
    enabled: !!id, 
  });
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => InventoryService.createNote(data),
    onSuccess: () => {
      // Thành công thì báo React Query load lại danh sách phiếu kho
      queryClient.invalidateQueries({ queryKey: inventoryKeys.notes() });
      
      // Load lại luôn cả lịch sử kho vì phiếu kho mới chắc chắn làm thay đổi lịch sử
      queryClient.invalidateQueries({ queryKey: inventoryKeys.histories() });
    },
  });
};

export const useGetHistoryByVariant = (variantId) => {
  return useQuery({
    queryKey: inventoryKeys.historyByVariant(variantId),
    queryFn: async () => {
      const res = await InventoryService.getHistoryByVariant(variantId);
      let data = res.data?.data || res.data || [];
      if (Array.isArray(data)) {
         return [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sắp xếp ngày mới nhất lên đầu
      }
      return data;
    },
    // Khóa API nếu chưa chọn variant
    enabled: !!variantId,
  });
};