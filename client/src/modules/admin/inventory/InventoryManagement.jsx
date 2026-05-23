import React, { useState } from 'react';
import { Typography, Space } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import Button from '@/components/ui/Button';

// Import các Hooks và Components con
import { useGetAllNotes } from '@/hooks/useInventory';
import InventoryList from './components/InventoryList';
import InventoryFormModal from './components/InventoryFormModal';
import NoteDetailModal from './components/NoteDetailModal';
import InventoryHistoryModal from './components/InventoryHistoryModal';

const { Title } = Typography;

const InventoryManagement = () => {
    // 1. Data Fetching
    const { data: notes = [], isLoading } = useGetAllNotes();

    // 2. States for Modals
    const [isFormModalVisible, setIsFormModalVisible] = useState(false);
    const [formType, setFormType] = useState('IMPORT');

    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);

    const [historyModalVisible, setHistoryModalVisible] = useState(false);
    const [selectedVariantId, setSelectedVariantId] = useState(null);

    // 3. Handlers
    const openFormModal = (type) => {
        setFormType(type);
        setIsFormModalVisible(true);
    };

    const showDetail = (record) => {
        setSelectedNote(record);
        setIsDetailModalVisible(true);
    };

    const handleViewHistory = (variantId) => {
        setIsDetailModalVisible(false); // Đóng modal chi tiết để tránh đè lên nhau
        setSelectedVariantId(variantId);
        setHistoryModalVisible(true);
    };

  // 4. Render
    return (
    <div className=" max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-2 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">

        <Title level={3} className="!mb-0 text-slate-800 font-black tracking-tight">
            📦 Quản lý Kho Hàng
        </Title>

        <Space size="middle" className="flex flex-col sm:flex-row w-full lg:w-auto">

            <Button
            variant="primary"
            onClick={() => openFormModal('IMPORT')}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 h-10 rounded-xl shadow-md shadow-blue-200"
            >
            <PlusOutlined className="mr-2" /> Nhập Kho
            </Button>

            <Button
            variant="danger"
            onClick={() => openFormModal('EXPORT')}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 h-10 rounded-xl shadow-md shadow-orange-200 border-none"
            >
            <MinusOutlined className="mr-2" /> Xuất Kho
            </Button>

        </Space>
        </div>

        {/* List */}
        <InventoryList
        notes={notes}
        isLoading={isLoading}
        onShowDetail={showDetail}
        />

        {/* Modals */}
        <InventoryFormModal
        visible={isFormModalVisible}
        type={formType}
        onClose={() => setIsFormModalVisible(false)}
        />

        <NoteDetailModal
        visible={isDetailModalVisible}
        note={selectedNote}
        onClose={() => setIsDetailModalVisible(false)}
        onViewHistory={handleViewHistory}
        />

        <InventoryHistoryModal
        visible={historyModalVisible}
        onClose={() => setHistoryModalVisible(false)}
        variantId={selectedVariantId}
        variantName={`Phân loại ID: ${selectedVariantId}`}
        />

    </div>
    );
};

export default InventoryManagement;