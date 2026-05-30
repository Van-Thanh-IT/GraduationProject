import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InventoryService } from '@/services/inventory.service';

export const inventoryKeys = {
    all: ['inventory'],
    notes: (params = {}) => [...inventoryKeys.all, 'notes', params],
    noteDetail: (id) => [...inventoryKeys.all, 'note', id],
    histories: () => [...inventoryKeys.all, 'history'],
    historyByVariant: (variantId) => [...inventoryKeys.all, 'history', variantId],
};

export const useGetAllNotes = (params = {}) => {
    const { keyword, type, status, page = 1, limit = 10 } = params;

    return useQuery({
        queryKey: inventoryKeys.notes({ keyword, type, status, page, limit }),
        
        queryFn: async () => {
            const res = await InventoryService.getAllNotes({
                keyword: keyword || undefined,
                type: type || undefined,
                status: status || undefined,
                page,
                limit,
            });

            return res.data?.data;
        },

        keepPreviousData: true,
        staleTime: 0,
    });
};
// Các hook khác giữ nguyên
export const useGetNoteById = (id) => {
    return useQuery({
        queryKey: inventoryKeys.noteDetail(id),
        queryFn: async () => {
            const res = await InventoryService.getNoteById(id);
            return res.data?.data || res.data;
            
        },
        enabled: !!id,
    });
};

export const useCreateNote = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data) => InventoryService.createNote(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.notes() });
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
            console.log(data);
            if (Array.isArray(data)) {
                return [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            }
            return data;
        },
        enabled: !!variantId,
    });
};