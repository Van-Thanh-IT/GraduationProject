// File: src/modules/admin/inventory/components/InventoryHistoryModal.jsx
import React from 'react';
import { Modal, Tag, Typography, Tooltip } from 'antd';
import CustomTable from '@/components/ui/CustomTable'; 
import Button from '@/components/ui/Button';
import { useGetHistoryByVariant } from '@/hooks/useInventory';
import moment from 'moment';

const { Text } = Typography;

const InventoryHistoryModal = ({ visible, onClose, variantId, variantName }) => {
    const { data: historyData = [], isLoading } = useGetHistoryByVariant(visible ? variantId : null);
   
    // Render Tag nghiệp vụ thông minh
    const renderReferenceTag = (type, id) => {
        const config = {
            'INVENTORY_NOTE': { color: 'blue', label: 'Phiếu Kho' },
            'ORDER': { color: 'green', label: 'Đơn hàng' },
            'RETURN': { color: 'volcano', label: 'Trả hàng' }
        };
        const item = config[type] || { color: 'default', label: type };
        return <Tag color={item.color}>{item.label} #{id}</Tag>;
    };

    const columns = [
        {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            width: 160,
            render: (date) => date ? (
                <div className="flex flex-col">
                    <span className="font-semibold text-slate-700">{moment(date).format('DD/MM/YYYY')}</span>
                    <span className="text-[11px] text-slate-400">{moment(date).format('HH:mm:ss')}</span>
                </div>
            ) : <span className="text-gray-400 italic">---</span>
        },
        {
            title: 'Nghiệp vụ & Ghi chú',
            render: (_, record) => (
                <div className="flex flex-col gap-1">
                    <Tooltip title={record.note}>
                        <span className="font-medium text-slate-800 text-[13px] line-clamp-1">{record.note}</span>
                    </Tooltip>
                    <div>{renderReferenceTag(record.referenceType, record.referenceId)}</div>
                </div>
            )
        },
        {
            title: 'Số lượng',
            children: [
                {
                    title: 'Đầu',
                    dataIndex: 'previousQuantity',
                    align: 'center',
                    width: 80,
                    render: (val) => <span className="text-slate-500 font-medium">{val}</span>
                },
                {
                    title: 'Biến động',
                    dataIndex: 'changeAmount',
                    align: 'center',
                    width: 100,
                    render: (amount) => (
                        <span className={`font-black ${amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {amount > 0 ? `+${amount}` : amount}
                        </span>
                    )
                },
                {
                    title: 'Cuối',
                    dataIndex: 'newQuantity',
                    align: 'center',
                    width: 80,
                    render: (val) => <span className="font-bold text-blue-600">{val}</span>
                }
            ]
        }
    ];

    return (
        <Modal
            title={
                <div className="flex flex-col gap-1">
                    <span className="text-lg font-bold text-slate-800">Lịch sử biến động</span>
                    {variantName && <span className="text-[12px] font-medium text-slate-400 uppercase tracking-wide">{variantName}</span>}
                </div>
            }
            open={visible}
            onCancel={onClose}
            width={850}
            centered
            footer={[
                <Button key="close" variant="secondary" onClick={onClose} className="px-6 font-bold">
                    Đóng cửa sổ
                </Button>
            ]}
            destroyOnClose
        >
            <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <CustomTable 
                    columns={columns} 
                    dataSource={historyData} 
                    loading={isLoading}
                    rowKey="id"
                    showPagination={historyData.length > 10}
                    pageSize={10}
                    scroll={{ y: 400 }}
                    className="[&_.ant-table-thead_th]:!bg-slate-50"
                />
            </div>
        </Modal>
    );
};

export default InventoryHistoryModal;