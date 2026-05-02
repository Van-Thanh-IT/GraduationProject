import React, { useState } from 'react';
import { message, Switch, Tooltip } from 'antd';
import { Plus, Edit2, Zap, Search } from 'lucide-react';
import CustomTable from '@/components/ui/CustomTable';
import Button from '@/components/ui/Button';
import { FlashSaleForm } from './FlashSaleForm';
import { useGetFlashSales, useToggleFlashSaleStatus } from '@/hooks/useFlashSales';

const FlashSaleManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  // 1. Lấy data từ React Query
  const { data: flashSales = [], isLoading } = useGetFlashSales();
  const { mutate: toggleStatus } = useToggleFlashSaleStatus();

  const handleToggleStatus = (checked, id) => {
    toggleStatus({ id, status: checked ? 1 : 0 }, {
      onSuccess: () => message.success(checked ? 'Đã bật chương trình!' : 'Đã tắt chương trình!')
    });
  };

  const filteredSales = flashSales.filter((sale) =>
    sale.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      title: 'Sản Phẩm',
      key: 'product',
      width: 300,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <img src={row.thumbnail} alt="thumb" className="w-12 h-12 object-cover rounded-xl border border-orange-100" />
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 line-clamp-1">{row.productName}</span>
            <span className="text-[10px] text-orange-500 bg-orange-50 w-max px-2 py-0.5 rounded-full font-bold mt-1 uppercase">
              {row.variantOptions}
            </span>
          </div>
        </div>
      )
    },
    {
      title: 'Giá Cả',
      key: 'price',
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="text-orange-600 font-black text-lg">
            {new Intl.NumberFormat('vi-VN').format(row.flashSalePrice)}đ
          </span>
          <div className="flex items-center gap-2 text-xs text-slate-400">
             <span className="line-through">{new Intl.NumberFormat('vi-VN').format(row.originalPrice)}đ</span>
             <span className="text-red-500 font-bold">-{row.discountPercentage}%</span>
          </div>
        </div>
      )
    },
    {
      title: 'Trạng Thái',
      key: 'time',
      render: (_, row) => {
        const start = new Date(row.startTime);
        const now = new Date();
        
        let statusConfig = { label: 'Đã kết thúc', class: 'bg-slate-100 text-slate-500' };
        
        if (row.status === 1) {
          if (row.isActiveNow) statusConfig = { label: 'Đang diễn ra', class: 'bg-green-500 text-white animate-pulse' };
          else if (start > now) statusConfig = { label: 'Sắp tới', class: 'bg-blue-500 text-white' };
        } else {
          statusConfig = { label: 'Đã tắt', class: 'bg-red-100 text-red-500' };
        }

        return (
          <div className="flex flex-col gap-2">
            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md w-max ${statusConfig.class}`}>
              {statusConfig.label}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {start.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(row.endTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      }
    },
    {
      title: 'Tiến Độ',
      key: 'stock',
      align: 'center',
      render: (_, row) => (
        <div className="flex flex-col items-center w-32">
           <div className="flex justify-between w-full mb-1 text-[11px] font-bold">
              <span>Đã bán: {row.soldQuantity}</span>
              <span className="text-slate-400">{row.saleStockQuantity}</span>
           </div>
           <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
              <div 
                className={`h-full transition-all duration-500 ${row.isSoldOut ? 'bg-red-500' : 'bg-orange-500'}`}
                style={{ width: `${Math.min((row.soldQuantity / row.saleStockQuantity) * 100, 100)}%` }}
              ></div>
           </div>
           {row.isSoldOut && <span className="text-[10px] text-red-500 font-black mt-1">HẾT HÀNG</span>}
        </div>
      )
    },
    {
        title: 'Bật/Tắt',
        dataIndex: 'status',
        align: 'center',
        render: (val, row) => (
          <Switch 
            checked={val === 1} 
            onChange={(checked) => handleToggleStatus(checked, row.id)}
            className={val === 1 ? 'bg-orange-500' : 'bg-slate-300'}
          />
        )
      },
    {
      title: 'Sửa',
      key: 'actions',
      align: 'center',
      render: (_, row) => (
        <button
          onClick={() => { setSelectedSale(row); setIsModalOpen(true); }}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
        >
          <Edit2 size={18} />
        </button>
      )
    },
  ];

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
    
    {/* HEADER */}
    <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center mb-8">

      {/* TITLE */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-orange-500 text-white rounded-2xl shadow-lg shadow-orange-200">
          <Zap size={24} fill="currentColor" />
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Flash Sale Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Quản lý các đợt giảm giá chớp nhoáng
          </p>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">

        {/* SEARCH */}
        <div className="relative w-full sm:w-64">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* BUTTON */}
        <Button
          onClick={() => {
            setSelectedSale(null);
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white border-none h-11 px-6 rounded-xl font-bold shadow-lg shadow-orange-200"
        >
          <Plus size={14} className="mr-2" />
          Tạo Deal Mới
        </Button>

      </div>
    </div>

    <CustomTable
      columns={columns}
      dataSource={filteredSales}
      loading={isLoading}
      rowKey="id"
    />

    <FlashSaleForm 
      isOpen={isModalOpen} 
      initialData={selectedSale} 
      onClose={() => setIsModalOpen(false)} 
      onSuccess={() => setIsModalOpen(false)}
    />
  </div>
  );
};

export default FlashSaleManagement;