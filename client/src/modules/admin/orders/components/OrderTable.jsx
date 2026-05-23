// File: src/modules/admin/orders/components/OrderTable.jsx
import React, { useState } from 'react';
import CustomTable from '@/components/ui/CustomTable';
import { Eye, FileDown, Hash, User, CreditCard, CalendarDays, Loader2 } from 'lucide-react';

const STATUS_CONFIG = {
  PENDING: { label: 'Chờ xác nhận', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  READY_TO_SHIP: { label: 'Chờ lấy hàng', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' },
  SHIPPING: { label: 'Đang giao hàng', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  DELIVERED: { label: 'Đã giao (Chờ ĐS)', color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200' },
  COMPLETED: { label: 'Hoàn thành', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  CANCELLED: { label: 'Đã hủy', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
  RETURNED: { label: 'Chuyển hoàn', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-300' },
};

const PAYMENT_CONFIG = {
  PENDING: { label: 'Chưa thanh toán', color: 'text-gray-500' },
  COMPLETED: { label: 'Đã thanh toán', color: 'text-emerald-600' },
  FAILED: { label: 'Thanh toán thất bại', color: 'text-red-500' },
  REFUNDED: { label: 'Đã hoàn tiền', color: 'text-blue-500' },
};
const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const DownloadVatButton = ({ orderId, onDownloadInvoice }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async (e) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      await onDownloadInvoice(orderId);
    } catch (error) {
       console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isLoading}
      className={`ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-white border text-emerald-600 rounded-md transition-all shadow-sm group ${
        isLoading ? 'border-emerald-100 opacity-70 cursor-wait' : 'border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300'
      }`}
      title="Tải hóa đơn VAT (PDF)"
    >
      {isLoading ? (
        <Loader2 size={14} className="animate-spin text-emerald-500" />
      ) : (
        <FileDown size={14} className="group-hover:-translate-y-0.5 transition-transform" />
      )}
      <span className="text-[10px] font-bold uppercase tracking-wide">
        {isLoading ? 'Đang tải...' : 'Tải VAT'}
      </span>
    </button>
  );
};

export default function OrderTable({ data, loading, onView, onDownloadInvoice, rowSelection }) {
  const columns = [
    {
      title: 'Mã & Thời gian',
      key: 'code',
      render: (_, row) => (
        <div className="flex flex-col items-start gap-1.5 py-1">
          <div className="flex items-center gap-1 bg-gray-100/80 px-2 py-1 rounded-md border border-gray-200/60">
            <Hash size={12} className="text-gray-500" />
            <span className="font-extrabold text-gray-800 tracking-wider text-xs">{row.code}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium pl-0.5">
            <CalendarDays size={12} className="text-gray-400" />
            {new Date(row.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
          </div>
        </div>
      )
    },
    { 
      title: 'Khách hàng & Hóa đơn', 
      key: 'customer',
      with: 300,
      render: (_, row) => (
         <div className="flex flex-col gap-1.5">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 p-1 bg-blue-50 text-blue-500 rounded-full">
                <User size={14} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-800 text-sm leading-tight">{row.customerName}</span>
                <span className="text-[11px] font-medium text-gray-500 mt-0.5">{row.customerPhone}</span>
              </div>
            </div>
            
            {row.isVatRequired && (
              <div className="flex flex-wrap items-center gap-2 mt-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                <span className={`px-1.5 py-0.5 text-[9px] font-black uppercase rounded border shadow-sm ${
                  row.orderStatus === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-purple-50 text-purple-600 border-purple-200'
                }`}>
                  {row.orderStatus === 'COMPLETED' ? 'Đã xuất VAT' : 'Yêu cầu VAT'}
                </span>
                
                <span className="text-[10px] text-gray-600 font-medium truncate max-w-[140px]" title={row.companyName}>
                  {row.companyName}
                </span>

                {row.orderStatus === 'PENDING' && (
                   <DownloadVatButton orderId={row.id} onDownloadInvoice={onDownloadInvoice} />
                )}
              </div>
            )}
         </div>
      )
    },
    {
      title: 'Thanh toán',
      key: 'payment',
      render: (_, row) => {
         const payConf = PAYMENT_CONFIG[row.paymentStatus] || PAYMENT_CONFIG.PENDING;
         return (
           <div className="flex flex-col items-start gap-1.5">
              <span className="text-[15px] font-black text-rose-600">{formatCurrency(row.finalAmount)}</span>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                 <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 rounded">
                   <CreditCard size={10} />
                   <span>{row.paymentMethod}</span>
                 </div>
                 <span className={`${payConf.color} flex items-center gap-1`}>
                   <span className={`w-1.5 h-1.5 rounded-full ${row.paymentStatus === 'COMPLETED' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                   {payConf.label}
                 </span>
              </div>
           </div>
         )
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'orderStatus',
      align: 'center',
      render: (val) => {
        const conf = STATUS_CONFIG[val] || STATUS_CONFIG.PENDING;
        return (
          <span className={`inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border shadow-sm ${conf.bg} ${conf.color} ${conf.border}`}>
             {conf.label}
          </span>
        )
      }
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      align: 'center',
      width: 80,
      render: (_, row) => (
        <button
          onClick={() => onView(row)}
          className="mx-auto flex items-center justify-center w-8 h-8 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all shadow-sm border border-blue-100 bg-blue-50/50 group"
          title="Xem chi tiết"
        >
          <Eye size={16} className="group-hover:scale-110 transition-transform" />
        </button>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <CustomTable
        columns={columns}
        dataSource={data} 
        loading={loading}
        rowKey="id"
        bordered={false}
        className="custom-modern-table" 
        rowSelection={rowSelection} 
       
      />
    </div>
  );
}