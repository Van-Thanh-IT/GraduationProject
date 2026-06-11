import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import moment from 'moment';
import CustomTable from '@/components/ui/CustomTable';
import { formatNumber } from '@/utils/format';
import { useNavigate } from 'react-router-dom';

const ORDER_STATUS = {
  PENDING: { label: 'Chờ xác nhận', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  READY_TO_SHIP: { label: 'Chờ lấy hàng', color: 'bg-violet-50 text-violet-600 border-violet-200' },
  SHIPPING: { label: 'Đang giao', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  DELIVERED: { label: 'Đã giao', color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-rose-50 text-rose-600 border-rose-200' },
};

export default function RecentOrders({ orders }) {
  const navigate = useNavigate();
  const columns = [
    { 
      title: 'Mã Đơn', 
      dataIndex: 'orderCode',
      render: (val) => (
        <span className="font-bold text-slate-700 tracking-tight bg-slate-100/80 px-3 py-1.5 rounded-lg text-[13px] border border-slate-200/60 font-mono">
          {val}
        </span>
      )
    },
    { 
      title: 'Khách Hàng', 
      dataIndex: 'customerName',
      render: (val) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
            {val?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <span className="font-bold text-slate-700 text-[14px]">{val}</span>
        </div>
      )
    },
    { 
      title: 'Thời Gian', 
      dataIndex: 'createdAt',
      render: (val) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Clock size={15} className="text-slate-400 shrink-0" />
          <div className="flex flex-col leading-tight">
            <span className="text-[13px] font-bold text-slate-700">{moment(val).format('HH:mm')}</span>
            <span className="text-[11px] font-medium text-slate-400">{moment(val).format('DD/MM/YYYY')}</span>
          </div>
        </div>
      )
    },
    { 
      title: 'Tổng Tiền', 
      dataIndex: 'finalAmount',
      align: 'right',
      render: (val) => (
        <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 text-[15px]">
          {formatNumber(val)}đ
        </span>
      )
    },
    { 
      title: 'Trạng Thái', 
      dataIndex: 'status',
      align: 'right',
      render: (val) => {
        const conf = ORDER_STATUS[val] || ORDER_STATUS.PENDING;
        return (
          <span className={`inline-flex px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wide border ${conf.color}`}>
            {conf.label}
          </span>
        );
      }
    }
  ];

  return (
    <div className="xl:col-span-2 bg-white rounded-[24px] shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow h-full">
      {/* HEADER */}
      <div className="p-4 md:px-6 md:py-5 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-[24px]">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Đơn Hàng Gần Đây</h3>
          <p className="text-[13px] font-medium text-slate-400 mt-1">Các giao dịch vừa được khởi tạo</p>
        </div>
        <button onClick={() => navigate("/admin/orders")} className="flex items-center gap-1.5 text-[13px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors px-4 py-2.5 rounded-xl">
          Xem tất cả <ArrowRight size={16} strokeWidth={2.5} />
        </button>
      </div>
      
      {/* TABLE BỌC GỌN GÀNG VỚI CLASS CUSTOM */}
      <div className="flex-1 w-full p-2 custom-dashboard-table">
        <CustomTable 
          dataSource={orders}
          rowKey="orderCode"
          pagination={false}
          columns={columns}
        />
      </div>
    </div>
  );
}