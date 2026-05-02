import React from 'react';
import { Modal, Tag, Typography } from 'antd';
import CustomTable from '@/components/ui/CustomTable'; 
import Button from '@/components/ui/Button';
import { useGetHistoryByVariant } from '@/hooks/useInventory';

const { Text } = Typography;

const InventoryHistoryModal = ({ visible, onClose, variantId, variantName }) => {
    // Gọi Hook lấy lịch sử. Nếu !visible hoặc !variantId, API sẽ không được gọi nhờ thuộc tính 'enabled' trong hook
    const { data: historyData = [], isLoading } = useGetHistoryByVariant(visible ? variantId : null);

    // Hàm render màu sắc cho Loại chứng từ
    const renderReferenceTag = (type, id) => {
        switch (type) {
            case 'INVENTORY_NOTE':
                return <Tag color="blue">Phiếu Kho #{id}</Tag>;
            case 'ORDER':
                return <Tag color="green">Đơn hàng #{id}</Tag>;
            case 'RETURN':
                return <Tag color="volcano">Khách trả hàng #{id}</Tag>;
            default:
                return <Tag>{type} #{id}</Tag>;
        }
    };

    const columns = [
        {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 160,
            render: (date) => {
                const d = new Date(date);
                return <Text>{d.toLocaleDateString('vi-VN')} {d.toLocaleTimeString('vi-VN')}</Text>;
            }
        },
        {
            title: 'Nghiệp vụ',
            key: 'reference',
            width: 180,
            render: (_, record) => (
                <div className="flex flex-col gap-1">
                    <span className="font-medium text-slate-700">{record.note}</span>
                    <div>{renderReferenceTag(record.referenceType, record.referenceId)}</div>
                </div>
            )
        },
        {
            title: 'Tồn đầu',
            dataIndex: 'previousQuantity',
            key: 'previousQuantity',
            align: 'center',
            width: 100,
            render: (val) => <Text className="text-gray-500">{val}</Text>
        },
        {
            title: 'Biến động',
            dataIndex: 'changeAmount',
            key: 'changeAmount',
            align: 'center',
            width: 120,
            render: (amount) => {
                // Đổi màu: Dương -> Xanh lá, Âm -> Đỏ
                const isPositive = amount > 0;
                return (
                    <div className={`font-bold text-base ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                        {isPositive ? `+${amount}` : amount}
                    </div>
                );
            }
        },
        {
            title: 'Tồn cuối',
            dataIndex: 'newQuantity',
            key: 'newQuantity',
            align: 'center',
            width: 100,
            render: (val) => <Text strong className="text-blue-600 text-base">{val}</Text>
        }
    ];

    return (
        <Modal
            title={
                <div>
                    <span className="text-xl font-bold">Lịch sử biến động kho</span>
                    {variantName && <div className="text-sm font-normal text-gray-500 mt-1">Sản phẩm: {variantName}</div>}
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="close" variant="secondary" onClick={onClose}>
                    Đóng lại
                </Button>
            ]}
            width={850}
            destroyOnClose
        >
            <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden">
                <CustomTable 
                    columns={columns} 
                    dataSource={historyData} 
                    loading={isLoading}
                    rowKey="id"
                    showPagination={true}
                    pageSize={10}
                    scroll={{ y: 400 }} // Fix chiều cao bảng, cuộn bên trong để Modal không bị quá dài
                />
            </div>
        </Modal>
    );
};

export default InventoryHistoryModal;