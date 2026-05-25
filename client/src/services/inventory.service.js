import API from "@/api/API";

export const InventoryService = {
    // 1. Quản lý Phiếu Kho
    getAllNotes: ( params ) => {
        return API.get('/management/inventory/notes', { params });
    },
    getNoteById: (id) => {
        return API.get(`/management/inventory/notes/${id}`);
    },
    createNote: (data) => {
        return API.post('/management/inventory/notes', data);
    },

    // 2. Lịch sử kho
    getHistoryByVariant: (variantId) => {
        return API.get(`/management/inventory/history/${variantId}`);
    }
};