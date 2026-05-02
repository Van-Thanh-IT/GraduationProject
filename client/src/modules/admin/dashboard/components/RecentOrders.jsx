import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import moment from 'moment';
import CustomTable from '@/components/ui/CustomTable';
import { formatNumber } from '@/utils/format';

const ORDER_STATUS = {
  PENDING: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  READY_TO_SHIP: { label: 'Chờ lấy hàng', color: 'bg-violet-100 text-violet-700 border-violet-200' },
  SHIPPING: { label: 'Đang giao', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  DELIVERED: { label: 'Đã giao', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-rose-100 text-rose-700 border-rose-200' },
};

export default function RecentOrders({ orders }) {
  const columns = [
    { 
      title: 'Mã Đơn', 
      dataIndex: 'orderCode',
      render: (val) => <span className="font-black text-slate-700 tracking-wide bg-slate-100 px-2.5 py-1 rounded-lg text-xs">{val}</span>
    },
    { 
      title: 'Khách Hàng', 
      dataIndex: 'customerName',
      render: (val) => <span className="font-bold text-slate-800">{val}</span>
    },
    { 
      title: 'Thời Gian', 
      dataIndex: 'createdAt',
      render: (val) => (
        <div className="flex items-center gap-1.5 text-slate-500">
          <Clock size={14} className="text-slate-400" />
          <span className="text-xs font-semibold">{moment(val).format('HH:mm')}</span>
          <span className="text-[10px] font-medium opacity-70 ml-1">{moment(val).format('DD/MM')}</span>
        </div>
      )
    },
    { 
      title: 'Tổng Tiền', 
      dataIndex: 'finalAmount',
      align: 'right',
      render: (val) => <span className="font-black text-indigo-600 text-sm">{formatNumber(val)}đ</span>
    },
    { 
      title: 'Trạng Thái', 
      dataIndex: 'status',
      align: 'center',
      render: (val) => {
        const conf = ORDER_STATUS[val] || ORDER_STATUS.PENDING;
        return <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${conf.color}`}>{conf.label}</span>
      }
    }
  ];

  return (
    <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h3 className="text-lg font-black text-slate-800">Đơn Hàng Mới Nhất</h3>
          <p className="text-xs font-medium text-slate-400 mt-0.5">Các giao dịch vừa được khởi tạo</p>
        </div>
        <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors">
          Xem tất cả <ArrowRight size={16} />
        </button>
      </div>
      
      <div className="flex-1 overflow-x-auto p-2">
        <CustomTable 
          dataSource={orders}
          rowKey="orderCode"
          pagination={false}
          className="dashboard-table"
          columns={columns}
        />
      </div>
    </div>
  );
}