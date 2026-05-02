// File: src/modules/client/order/OrderDetailPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Spin, Button } from 'antd';
import { Package, ArrowLeft, MapPin, Truck, Receipt, CreditCard, Box, Clock, ClipboardCheck, CheckCircle2, ShieldCheck, XCircle, RotateCcw, AlertTriangle } from 'lucide-react';

import { useGetOrderDetail } from '@/hooks/useOrders';
import CancelOrderModal from './components/CancelOrderModal';

const STATUS_CONFIG = {
  PENDING: { text: 'Chờ xác nhận', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
  CONFIRMED: { text: 'Đã xác nhận', color: 'text-blue-600', bg: 'bg-blue-50', icon: ClipboardCheck },
  READY_TO_SHIP: { text: 'Chờ lấy hàng', color: 'text-violet-600', bg: 'bg-violet-50', icon: Box },
  SHIPPING: { text: 'Đang giao hàng', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Truck },
  DELIVERED: { text: 'Đã giao hàng', color: 'text-cyan-600', bg: 'bg-cyan-50', icon: CheckCircle2 },
  COMPLETED: { text: 'Hoàn thành', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: ShieldCheck },
  CANCELLED: { text: 'Đã hủy', color: 'text-rose-600', bg: 'bg-rose-50', icon: XCircle },
  RETURNED: { text: 'Chuyển hoàn', color: 'text-slate-600', bg: 'bg-slate-100', icon: RotateCcw },
};

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

export default function OrderDetailPage() {
  const { orderId } = useParams(); 
  const navigate = useNavigate();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const { data: order, isLoading } = useGetOrderDetail(orderId);

  if (isLoading) {
    return <div className="min-h-[70vh] flex items-center justify-center"><Spin size="large" /></div>;
  }

  if (!order) {
    return (
      <div className="text-center py-20 flex flex-col items-center gap-4">
        <h2 className="text-xl font-bold text-gray-600">Đơn hàng không tồn tại!</h2>
        <Button onClick={() => navigate('/user/orders')} type="primary">Quay lại danh sách</Button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PENDING;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100vh-64px)] w-full font-sans pt-6 pb-12">
      {/* THU GỌN LẠI VỚI max-w-[1050px] CHO ĐỒNG BỘ */}
      <div className="w-full max-w-[1050px] mx-auto px-4 lg:px-0">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <button 
            onClick={() => navigate('/user/orders')} 
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-colors group w-fit"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Trở lại danh sách
          </button>

          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Mã đơn: <span className="text-gray-800">{order.code}</span></span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-bold text-[12px] uppercase tracking-wider ${statusConfig.color} ${statusConfig.bg}`}>
              <StatusIcon size={16} /> {statusConfig.text}
            </span>
          </div>
        </div>

        {order.orderStatus === 'CANCELLED' && order.cancelReason && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
             <AlertTriangle size={20} className="text-rose-500 mt-0.5" />
             <div>
                <h4 className="font-bold text-rose-700">Đơn hàng đã bị hủy</h4>
                <p className="text-sm text-rose-600 mt-1">Lý do: {order.cancelReason}</p>
             </div>
          </div>
        )}

        <div className="flex flex-col gap-5">
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50/80 border-b border-gray-100 px-6 py-4 flex items-center gap-2">
              <MapPin size={20} className="text-blue-600" />
              <h3 className="font-black text-gray-800 text-[16px]">Địa Chỉ Nhận Hàng</h3>
            </div>
            <div className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1">
                <p className="text-base font-bold text-gray-800">{order.customerName}</p>
                <p className="text-[15px] text-gray-500 mt-1 font-medium">{order.customerPhone}</p>
                <p className="text-[15px] text-gray-600 mt-2 leading-relaxed">{order.fullShippingAddress}</p>
              </div>
              <div className="w-px bg-gray-100 hidden md:block"></div>
              <div className="flex-1 md:pl-6">
                <h4 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Truck size={16} /> Thông tin vận chuyển
                </h4>
                <p className="text-[15px] font-bold text-gray-700 mb-1">{order.shippingCarrier || 'Đang cập nhật'}</p>
                <p className="text-[14px] text-gray-500">Mã vận đơn: <span className="font-bold text-blue-600 cursor-pointer">{order.trackingNumber || 'Chưa có'}</span></p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50/80 border-b border-gray-100 px-6 py-4 flex items-center gap-2">
              <Package size={20} className="text-blue-600" />
              <h3 className="font-black text-gray-800 text-[16px]">Sản Phẩm Đã Mua</h3>
            </div>
            <div className="px-6 py-2">
              {order.items?.map((item, index) => (
                <div key={index} className="flex gap-4 items-center py-5 border-b border-gray-50 last:border-0">
                  <div className="w-20 h-20 shrink-0 border border-gray-200 rounded-lg overflow-hidden p-1">
                    <img src={item.thumbnail} alt={item.productName} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex flex-col max-w-[500px]">
                      <Link to={`/product/${item.productId}`} className="text-[15px] font-bold text-gray-800 line-clamp-2 hover:text-blue-600">
                        {item.productName}
                      </Link>
                      <span className="text-[13px] font-medium text-gray-500 mt-2 bg-gray-100 w-fit px-2 py-0.5 rounded">
                        {item.variantInfo}
                      </span>
                    </div>
                    <div className="shrink-0 flex flex-row md:flex-col items-center md:items-end justify-between">
                      <span className="text-[15px] font-bold text-gray-700">{formatCurrency(item.price)}</span>
                      <span className="text-[14px] font-semibold text-gray-500 mt-1">x {item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-4 border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6">
                  <div>
                    <h4 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <CreditCard size={16} /> Phương thức thanh toán
                    </h4>
                    <p className="text-[15px] font-bold text-gray-700">
                      {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : `Thanh toán Online (${order.paymentMethod})`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center text-[15px] font-medium text-gray-600">
                    <span>Tổng tiền hàng</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[15px] font-medium text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span>{formatCurrency(order.shippingFee)}</span>
                  </div>
                  <div className="w-full h-px bg-gray-100 my-2"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-[16px] font-bold text-gray-800">Thành tiền</span>
                    <span className="text-2xl font-black text-rose-600 tracking-tight">{formatCurrency(order.finalAmount)}</span>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <CancelOrderModal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} orderCode={order.code} />
    </div>
  );
}