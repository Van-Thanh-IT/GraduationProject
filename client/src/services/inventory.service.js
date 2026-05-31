import API from "@/api/API";

export const InventoryService = {
    // 1. Quản lý Phiếu Kho
    getAllNotes: ( params ) => {
        return API.get('/api/management/inventory/notes', { params });
    },
    getNoteById: (id) => {
        return API.get(`/api/management/inventory/notes/${id}`);
    },
    createNote: (data) => {
        return API.post('/api/management/inventory/notes', data);
    },

    // 2. Lịch sử kho
    getHistoryByVariant: (variantId) => {
        return API.get(`/api/management/inventory/history/${variantId}`);
    }
};