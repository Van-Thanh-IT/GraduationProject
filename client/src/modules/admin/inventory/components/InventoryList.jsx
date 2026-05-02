import React from 'react';
import { Typography } from 'antd';
import { 
    EyeOutlined, 
    ArrowDownOutlined, 
    ArrowUpOutlined, 
    FileTextOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import CustomTable from '@/components/ui/CustomTable';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/utils/format';

const { Text } = Typography;

const InventoryList = ({ notes, isLoading, onShowDetail }) => {
    
    const columns = [
        { 
            title: 'Mã Phiếu', 
            dataIndex: 'code', 
            width: 160,
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
            width: 140,
            render: (type) => {
                const isImport = type === 'IMPORT';
                return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${
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
            title: 'Lý do / Mục đích', 
            dataIndex: 'reason',
            render: (text) => (
                <span className="text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1 rounded-md line-clamp-1" title={text}>
                    {text}
                </span>
            )
        },
        { 
            title: 'Tổng Giá Trị', 
            dataIndex: 'totalAmount', 
            align: 'right',
            width: 160,
            render: (amount, record) => (
                <div className="flex flex-col items-end">
                    <span className="font-black text-slate-800 text-base">
                        {formatCurrency(amount)}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                        {record.details?.length || 0} sản phẩm
                    </span>
                </div>
            ) 
        },
        { 
            title: 'Ngày Lập', 
            dataIndex: 'createdAt', 
            width: 140,
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
            title: 'Thao tác', 
            align: 'center', 
            width: 120,
            render: (_, record) => (
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onShowDetail(record)} 
                    className="w-full bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all rounded-lg font-semibold shadow-sm"
                >
                    <EyeOutlined className="mr-1.5" /> Chi tiết
                </Button>
            )
        },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Tùy chọn: Thêm một Header nhỏ cho bảng để card nhìn hoàn thiện hơn */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="font-bold text-slate-700 text-base">Danh sách chứng từ kho</span>
                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    Tổng: {notes.length} phiếu
                </span>
            </div>
            
            <div className="p-2">
                <CustomTable 
                    columns={columns} 
                    dataSource={notes} 
                    loading={isLoading} 
                    rowKey="id" 
                    total={notes.length} 
                />
            </div>
        </div>
    );
};

export default InventoryList;