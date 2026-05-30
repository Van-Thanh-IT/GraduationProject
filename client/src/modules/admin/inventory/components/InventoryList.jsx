import React from 'react';
import { Tag } from 'antd';
import { 
    EyeOutlined, 
    ArrowDownOutlined, 
    ArrowUpOutlined, 
    FileTextOutlined,
    ClockCircleOutlined,
    UserOutlined
} from '@ant-design/icons';
import moment from 'moment';
import CustomTable from '@/components/ui/CustomTable';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/utils/format';

const InventoryList = ({
  notes, isLoading, onShowDetail, total, currentPage, limit, onPageChange
}) => {
    
    const columns = [
        { 
            title: 'Mã Phiếu', 
            dataIndex: 'code', 
            width: 170,
            render: (text) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                        <FileTextOutlined className="text-lg" />
                    </div>
                    <span className="font-bold text-slate-700 tracking-tight">{text}</span>
                </div>
            )
        },
        {
            title: 'Loại Phiếu', 
            dataIndex: 'type', 
            width: 130,
            render: (type) => {
                const isImport = type === 'IMPORT';
                return (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${
                        isImport 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'bg-orange-50 text-orange-600 border-orange-200'
                    }`}>
                        {isImport ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
                        {isImport ? 'NHẬP KHO' : 'XUẤT KHO'}
                    </span>
                );
            }
        },
        { 
            title: 'Lý do & Người tạo', 
            key: 'info',
            render: (_, record) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700 line-clamp-1" title={record.reason}>
                        {record.reason || 'Không có lý do'}
                    </span>
                    <span className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <UserOutlined /> {record.fullName}
                    </span>
                </div>
            )
        },
        { 
            title: 'Tổng Giá Trị', 
            dataIndex: 'totalAmount', 
            align: 'right',
            width: 150,
            render: (amount, record) => (
                <div className="flex flex-col items-end">
                    <span className="font-black text-slate-800 text-[15px]">
                        {formatCurrency(amount)}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                        {record.details?.length || 0} sản phẩm
                    </span>
                </div>
            ) 
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            align: 'center',
            width: 120,
            render: (status) => {
                const statusConfig = {
                    COMPLETED: { color: 'green', text: 'Hoàn thành' },
                    PENDING: { color: 'gold', text: 'Chờ xử lý' },
                    CANCELLED: { color: 'red', text: 'Đã hủy' },
                };
                const config = statusConfig[status] || { color: 'default', text: status };
                
                return (
                    <Tag color={config.color} className="rounded-md font-medium px-2 py-0.5 border-0">
                        {config.text}
                    </Tag>
                );
            }
        },
        { 
            title: 'Ngày Lập', 
            dataIndex: 'createdAt', 
            width: 130,
            render: (date) => (
                <div className="flex items-start gap-2">
                    <ClockCircleOutlined className="text-slate-400 mt-0.5" />
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">
                            {moment(date).format('DD/MM/YYYY')}
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                            {moment(date).format('HH:mm')}
                        </span>
                    </div>
                </div>
            ) 
        },
        {
            title: '', 
            align: 'center', 
            width: 100,
            render: (_, record) => (
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onShowDetail(record)} 
                    className="w-full bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all rounded-lg font-semibold shadow-sm"
                >
                    <EyeOutlined className="mr-1.5" /> Xem
                </Button>
            )
        },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="font-bold text-slate-700 text-base">Danh sách chứng từ kho</span>
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    Tổng cộng: {total} phiếu
                </span>
            </div>
            
            <div className="p-0">
                <CustomTable 
                    columns={columns} 
                    dataSource={notes} 
                    loading={isLoading} 
                    rowKey="id" 
                    // THIẾT LẬP PAGINATION ĐỂ KHỚP VỚI LIMIT 20 CỦA BẠN
                    pagination={{
                        current: currentPage,
                        pageSize: limit,
                        total: total,
                        onChange: (page) => onPageChange(page),
                        showSizeChanger: false 
                    }}
                    className="border-none"
                />
            </div>
        </div>
    );
};

export default InventoryList;