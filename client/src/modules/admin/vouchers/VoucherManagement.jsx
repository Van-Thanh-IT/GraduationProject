import React, { useState } from 'react';
import { Popconfirm } from 'antd';
import { Plus, Edit2, Trash2, Tag, Search } from 'lucide-react';
import CustomTable from '@/components/ui/CustomTable';
import Button from '@/components/ui/Button';
import { VoucherForm } from './VoucherForm';
import { formatNumber } from '@/utils/format';

// Import React Query Hooks
import { useGetVouchers, useDeleteVoucher } from '@/hooks/useVouchers';
import { toast } from 'react-toastify';
import SEO from '@/components/SEO';

const VoucherManagement = () => {
  // State UI
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  // Hook Data
  const { data: vouchers = [], isLoading } = useGetVouchers();
  const { mutate: deleteVoucher } = useDeleteVoucher();

  const handleDelete = (id) => {
    deleteVoucher(id, {
      onSuccess: () => toast.success('Đã xóa Voucher thành công!'),
      onError: () => toast.error('Không thể xóa Voucher này do đã có người sử dụng!')
    });
  };

  // LOGIC TÌM KIẾM
  const filteredVouchers = vouchers.filter((voucher) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      voucher.name?.toLowerCase().includes(searchLower) ||
      voucher.code?.toLowerCase().includes(searchLower)
    );
  });

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60, align: 'center' },
    {
      title: 'Mã Code',
      dataIndex: 'code',
      render: (val) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-wider">
          {val}
        </span>
      ),
    },
    { 
      title: 'Tên Chương Trình', 
      dataIndex: 'name',
      render: (val) => <span className="font-semibold text-slate-700">{val}</span>
    },
    {
      title: 'Mức Giảm',
      dataIndex: 'discountValue',
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="text-red-500 font-black text-base whitespace-nowrap">
            {row.discountType === 'FIXED' ? `${formatNumber(val)}đ` : `${val}%`}
          </span>
          {row.discountType === 'PERCENT' && row.maxDiscountValue > 0 && (
             <span className="text-[10px] text-slate-400 font-medium">Tối đa: {formatNumber(row.maxDiscountValue)}đ</span>
          )}
        </div>
      ),
    },
    {
      title: 'Đơn Tối Thiểu',
      dataIndex: 'minOrderValue',
      render: (val) => <span className="text-slate-600 font-semibold">{formatNumber(val)}đ</span>,
    },
    {
      title: 'Đã Dùng',
      dataIndex: 'usedCount',
      align: 'center',
      render: (val, row) => (
        <div className="flex flex-col items-center">
          <span className="font-bold text-slate-800">
            {val} <span className="text-slate-400 font-medium">/ {row.usageLimit === 0 ? '∞' : row.usageLimit}</span>
          </span>
          {row.usageLimit > 0 && val >= row.usageLimit && (
             <span className="text-[10px] text-white bg-rose-500 px-1.5 py-0.5 rounded mt-1 font-bold uppercase tracking-wider">Hết lượt</span>
          )}
        </div>
      ),
    },
    {
      title: 'Hạn Dùng',
      dataIndex: 'endDate',
      render: (val) => {
        const date = new Date(val);
        const isExpired = date < new Date();
        return (
          <div className="flex flex-col">
            <span className={`text-sm font-bold ${isExpired ? "text-rose-500 line-through opacity-70" : "text-slate-700"}`}>
              {date.toLocaleDateString('vi-VN')}
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      align: 'center',
      width: 120,
      render: (_, row) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => { setSelectedVoucher(row); setIsModalOpen(true); }}
            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-all"
            title="Sửa Voucher"
          >
            <Edit2 size={16} />
          </button>
          
          <Popconfirm
            title="Xóa mã giảm giá?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(row.id)}
            okText="Xóa ngay"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <button
              className="p-2 text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-lg transition-all"
              title="Xóa Voucher"
            >
              <Trash2 size={16} />
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      <SEO title='Quản lý mã giảm giá' noIndex/>
      
      <div className="max-w-[1400px] mx-auto min-h-[calc(100vh-100px)]">
        
        {/* Header & Thanh công cụ (Toolbar) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <Tag size={24} fill="currentColor" className="text-white" />
            </div>
            <div>
                <h1 className="text-xl font-black text-slate-800 m-0 leading-tight">Kho Voucher</h1>
                <p className="text-sm text-slate-500 m-0 mt-1 font-medium">Thiết lập các chương trình khuyến mãi</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm mã hoặc tên voucher..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button
              onClick={() => { setSelectedVoucher(null); setIsModalOpen(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white border-none h-10 px-5 rounded-xl font-bold shadow-md shadow-indigo-200 flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus size={20} /> Tạo Voucher
            </Button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <CustomTable
            columns={columns}
            dataSource={filteredVouchers} 
            loading={isLoading}
            rowKey="id"
          />
        </div>

        {/* Modal */}
        <VoucherForm
          isOpen={isModalOpen}
          initialData={selectedVoucher}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => setIsModalOpen(false)}
        />
      </div>
    </>
  );
};

export default VoucherManagement;