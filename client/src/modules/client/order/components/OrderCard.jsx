// File: src/modules/client/order/components/OrderCard.jsx
import React from 'react';
import { Clock, ClipboardCheck, Box, Truck, CheckCircle2, ShieldCheck, XCircle, RotateCcw } from 'lucide-react';
import dayjs from 'dayjs';

const STATUS_CONFIG = {
  PENDING: { text: 'Chờ xác nhận', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
  CONFIRMED: { text: 'Đã xác nhận', color: 'text-blue-600', bg: 'bg-blue-50', icon: ClipboardCheck },
  READY_TO_SHIP: { text: 'Chờ lấy hàng', color: 'text-violet-600', bg: 'bg-violet-50', icon: Box },
  SHIPPING: { text: 'Đang giao hàng', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Truck },
  DELIVERED: { text: 'Đã giao thành công', color: 'text-cyan-600', bg: 'bg-cyan-50', icon: CheckCircle2 },
  COMPLETED: { text: 'Hoàn thành', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: ShieldCheck },
  CANCELLED: { text: 'Đã hủy', color: 'text-rose-600', bg: 'bg-rose-50', icon: XCircle },
  RETURNED: { text: 'Chuyển hoàn', color: 'text-slate-600', bg: 'bg-slate-100', icon: RotateCcw },
};

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

// 1. COMPONENT PHỤ GIÚP CODE RÚT GỌN (Tránh lặp lại e.stopPropagation)
const ActionButton = ({ onClick, className, children }) => (
  <button 
    onClick={(e) => { 
      e.stopPropagation(); 
      if (onClick) onClick(); 
    }}
    className={`flex-1 sm:flex-none px-6 py-2 text-sm font-bold rounded-lg transition-colors ${className}`}
  >
    {children}
  </button>
);

export default function OrderCard({ order, onViewDetail, onCancel, onGoToReviewTab }) {
  // 2. DESTRUCTURING: Lấy các biến cần thiết ra từ order
  const { id, code, createdAt, orderStatus, items, finalAmount, paymentMethod } = order;
  
  const statusConfig = STATUS_CONFIG[orderStatus] || STATUS_CONFIG.PENDING;
  const StatusIcon = statusConfig.icon;

  // 3. LOGIC HIỂN THỊ RÕ RÀNG
  const isFullyReviewed = items?.length > 0 && items.every(item => item.isReviewed);
  
  const showCancelBtn = orderStatus === 'PENDING';
  const showReviewBtn = orderStatus === 'COMPLETED' && !isFullyReviewed;
  const showReorderBtn = orderStatus === 'COMPLETED' || orderStatus === 'CANCELLED';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50 gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mã đơn:</span>
          <span className="font-extrabold text-gray-800 tracking-wide bg-white px-2 py-0.5 rounded border border-gray-200 text-sm">
            {code}
          </span>
          <span className="hidden sm:inline text-gray-300 mx-1">|</span>
          <span className="text-xs font-medium text-gray-500">
            {dayjs(createdAt).format('HH:mm DD/MM/YYYY')}
          </span>
        </div>

        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold text-[11px] uppercase tracking-wide border w-fit ${statusConfig.color} ${statusConfig.bg} border-${statusConfig.color.replace('text-', '')}/20`}>
          <StatusIcon size={14} />
          {statusConfig.text}
        </div>
      </div>

      {/* 2. Body */}
      <div 
        className="px-5 py-4 flex flex-col gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => onViewDetail && onViewDetail(id)}
      >
        {items.map((item, index) => (
          <div key={index} className="flex gap-4 items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0">
            <div className="w-20 h-20 shrink-0 border border-gray-100 rounded-lg overflow-hidden bg-white">
              <img src={item.thumbnail} alt={item.productName} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex flex-col">
                <h4 className="text-sm font-bold text-gray-800 line-clamp-2">{item.productName}</h4>
                <span className="text-[13px] font-medium text-gray-500 mt-1">Phân loại: {item.variantInfo}</span>
                <span className="text-sm font-semibold text-gray-800 mt-1">x{item.quantity}</span>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-sm font-bold text-rose-600">{formatCurrency(item.price)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Footer */}
      <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
        <div className="flex flex-col items-end sm:items-start w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Thành tiền:</span>
            <span className="text-xl font-black text-rose-600">{formatCurrency(finalAmount)}</span>
          </div>
          <span className="text-[11px] text-gray-500 font-medium mt-0.5 uppercase tracking-wider">
            {paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'Đã thanh toán Online'}
          </span>
        </div>
        
        {/* 4. CHỖ NÀY ĐƯỢC RÚT GỌN CỰC KỲ SẠCH SẼ NHỜ ACTION BUTTON */}
        <div className="flex gap-3 w-full sm:w-auto mt-2 sm:mt-0 flex-wrap justify-end">
          
          {showCancelBtn && (
            <ActionButton onClick={() => onCancel && onCancel(code)} className="bg-white border border-rose-300 hover:bg-rose-50 text-rose-600">
              Hủy đơn
            </ActionButton>
          )}

          {showReviewBtn && (
             <ActionButton onClick={onGoToReviewTab} className="bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-200">
               Đánh giá
             </ActionButton>
          )}

          {showReorderBtn && (
            <ActionButton onClick={() => { /* Logic Add to Cart */ }} className="bg-white border border-indigo-300 hover:bg-indigo-50 text-indigo-600">
              Mua lại
            </ActionButton>
          )}

          <ActionButton onClick={() => onViewDetail && onViewDetail(id)} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700">
            Xem chi tiết
          </ActionButton>

        </div>
      </div>
    </div>
  );
}