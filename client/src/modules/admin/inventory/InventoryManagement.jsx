import React, { useState, useEffect } from 'react';
import { Typography, Space, Input, Select } from 'antd';
import { PlusOutlined, MinusOutlined, SearchOutlined, ClearOutlined } from '@ant-design/icons';
import Button from '@/components/ui/Button';

import { useGetAllNotes } from '@/hooks/useInventory';
import { useDebounce } from '@/hooks/useDebounce';
import InventoryList from './components/InventoryList';
import InventoryFormModal from './components/InventoryFormModal';
import NoteDetailModal from './components/NoteDetailModal';
import InventoryHistoryModal from './components/InventoryHistoryModal';
import { ImportOutlined, ExportOutlined } from '@ant-design/icons';
import SEO from '@/components/SEO';

const { Title } = Typography;

const InventoryManagement = () => {
    // 1. States cho UI & Filters
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedKeyword = useDebounce(searchTerm, 500); 
    
    const [type, setType] = useState(undefined);
    const [page, setPage] = useState(1);
    const limit = 20;

    // 2. Data Fetching
    const { data: response, isLoading, refetch } = useGetAllNotes({
        keyword: debouncedKeyword,
        type,
        page,
        limit,
    });
    
    const notes = response?.items || [];
    const totalElements = response?.totalElements || 0;

    useEffect(() => {
        setPage(1);
    }, [debouncedKeyword, type]);

    // 3. Modal States
    const [isFormModalVisible, setIsFormModalVisible] = useState(false);
    const [formType, setFormType] = useState('IMPORT');
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const [historyModalVisible, setHistoryModalVisible] = useState(false);
    const [selectedVariantId, setSelectedVariantId] = useState(null);

    // 4. Handlers
    const openFormModal = (ft) => {
        setFormType(ft);
        setIsFormModalVisible(true);
    };

    const showDetail = (record) => {
        setSelectedNote(record);
        setIsDetailModalVisible(true);
    };

    const handleViewHistory = (variantId) => {
        setIsDetailModalVisible(false);
        setSelectedVariantId(variantId);
        setHistoryModalVisible(true);
    };

    const resetFilters = () => {
        setSearchTerm('');
        setType(undefined);
        setPage(1);
    };

    return (
        <>
            <SEO title='Quản lý kho hàng' noIndex/>
            
            <div className="max-w-7xl mx-auto p-2 space-y-2">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-white px-5 py-4 rounded-xl shadow-sm border border-slate-200">
                    <Title level={4} className="!mb-0 text-slate-800 font-bold">
                        📦 Quản lý Kho Hàng
                    </Title>
                    <Space size="middle" className="mt-4 md:mt-0">
                        <Button
                            variant="primary"
                            onClick={() => openFormModal('IMPORT')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center px-4 py-2 rounded-lg transition-colors font-medium border-none"
                        >
                            <ImportOutlined className="mr-2 text-lg" /> Nhập Kho
                        </Button>
                        
                        <Button
                            variant="danger"
                            onClick={() => openFormModal('EXPORT')}
                            className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm flex items-center justify-center px-4 py-2 rounded-lg transition-colors font-medium border-none"
                        >
                            <ExportOutlined className="mr-2 text-lg" /> Xuất Kho
                        </Button>
                    </Space>
                </div>

                {/* Filter Area */}
                <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-8">
                            <Input
                                prefix={<SearchOutlined className="text-slate-400" />}
                                placeholder="Tìm kiếm mã phiếu, lý do, người tạo..."
                                allowClear
                                size="large"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <Select
                                placeholder="Tất cả loại phiếu"
                                size="large"
                                className="w-full"
                                allowClear
                                value={type}
                                onChange={(value) => setType(value)}
                            >
                                <Select.Option value="IMPORT">Nhập Kho (Import)</Select.Option>
                                <Select.Option value="EXPORT">Xuất Kho (Export)</Select.Option>
                            </Select>
                        </div>
                        <div className="md:col-span-1 flex items-center justify-end">
                            <Button 
                                onClick={resetFilters} 
                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 h-10 rounded-lg flex items-center justify-center border-none"
                                title="Xóa bộ lọc"
                            >
                                <ClearOutlined />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* List Area */}
                <InventoryList
                    notes={notes}
                    isLoading={isLoading}
                    onShowDetail={showDetail}
                    // TRUYỀN PROPS ĐẦY ĐỦ ĐỂ SERVER-SIDE PAGINATION HOẠT ĐỘNG
                    total={totalElements}
                    currentPage={page}
                    limit={limit}
                    onPageChange={setPage}
                />

                {/* Modals */}
                <InventoryFormModal
                    visible={isFormModalVisible}
                    type={formType}
                    onClose={() => setIsFormModalVisible(false)}
                    onSuccess={() => {
                        setIsFormModalVisible(false);
                        refetch();
                    }}
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
                />
            </div>
        </>
    );
};

export default InventoryManagement;