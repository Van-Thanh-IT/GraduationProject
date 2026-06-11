// File: src/modules/client/order/OrderDetailPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Spin } from 'antd';
import { 
  ArrowLeft, MapPin, Truck, CreditCard, Box, Clock, 
  ClipboardCheck, CheckCircle2, ShieldCheck, XCircle, RotateCcw, AlertTriangle 
} from 'lucide-react';

import { useGetOrderDetail } from '@/hooks/useOrders';
import CancelOrderModal from './components/CancelOrderModal';
import { Helmet } from 'react-helmet-async';
import SEO from '@/components/SEO';

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
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50">
        <Spin />
        <span className="mt-2 text-gray-400 text-xs font-medium">Đang tải chi tiết đơn hàng...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16 flex flex-col items-center justify-center gap-3 bg-gray-50 min-h-[50vh] font-sans">
        <h2 className="text-base font-bold text-gray-600 m-0">Đơn hàng không tồn tại trên hệ thống!</h2>
        <button 
          onClick={() => navigate('/user/orders')} 
          className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-md hover:bg-blue-700 transition-colors"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PENDING;
  const StatusIcon = statusConfig.icon;

  return (
    <>
      <SEO title={`Chi tiết đơn hàng #${order?.code || orderId}`} noIndex/>
     
      <div className="bg-gray-50 min-h-screen w-full font-sans py-4 md:py-6">
        <div className="w-full max-w-[1000px] mx-auto px-4">
          
          {/* THANH HEADER ĐIỀU HƯỚNG KHÍT KHAO */}
          <div className="flex flex-row items-center justify-between mb-4 pb-2 border-b border-gray-200">
            <button 
              type="button"
              onClick={() => navigate('/user/orders')} 
              className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors group bg-transparent border-none cursor-pointer"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              Trở lại danh sách
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-gray-400 uppercase tracking-wide">Mã đơn: <span className="text-gray-800 font-mono">{order.code}</span></span>
              <span className="text-gray-200">|</span>
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide ${statusConfig.color} ${statusConfig.bg}`}>
                <StatusIcon size={13} /> {statusConfig.text}
              </span>
            </div>
          </div>

          {/* THÔNG BÁO LÝ DO HỦY ĐƠN PHẲNG */}
          {order.orderStatus === 'CANCELLED' && order.cancelReason && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                  <h4 className="font-bold text-red-800 text-xs m-0">Đơn hàng đã bị hủy bỏ</h4>
                  <p className="text-xs text-red-600 m-0 mt-0.5">Lý do từ hệ thống: {order.cancelReason}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            
            {/* KHỐI 1: ĐỊA CHỈ & THÔNG TIN GIAO HÀNG (CHIA 2 CỘT PHẲNG) */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden grid grid-cols-1 md:grid-cols-2">
              <div className="p-4 border-b md:border-b-0 md:border-r border-gray-100">
                <div className="flex items-center gap-1.5 text-blue-600 mb-2">
                  <MapPin size={16} />
                  <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wide m-0">Địa chỉ nhận hàng</h3>
                </div>
                <p className="text-sm font-bold text-gray-800 m-0">{order.customerName}</p>
                <p className="text-xs font-semibold text-gray-400 m-0 mt-0.5">{order.customerPhone}</p>
                <p className="text-xs text-gray-500 m-0 mt-1.5 leading-relaxed">{order.fullShippingAddress}</p>
              </div>
              
              <div className="p-4">
                <div className="flex items-center gap-1.5 text-blue-600 mb-2">
                  <Truck size={16} />
                  <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wide m-0">Thông tin vận chuyển</h3>
                </div>
                <p className="text-xs font-bold text-gray-700 m-0">{order.shippingCarrier || 'Đang cập nhật'}</p>
                <p className="text-xs text-gray-400 m-0 mt-1">
                  Mã vận đơn: <span className="font-bold text-blue-600 font-mono">{order.trackingNumber || 'Chưa phát hành'}</span>
                </p>
              </div>
            </div>

            {/* KHỐI 2: DANH SÁCH SẢN PHẨM ĐÃ MUA PHẲNG */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Chi tiết sản phẩm đã mua</span>
                <span className="text-xs font-bold text-gray-400 font-mono">({order.items?.length || 0}) SP</span>
              </div>
              <div className="px-4 divide-y divide-gray-100">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex gap-3 items-center py-3">
                    <div className="w-14 h-14 shrink-0 border border-gray-200 rounded-md bg-white p-1 flex items-center justify-center overflow-hidden">
                      <img src={item.thumbnail} alt={item.productName} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-row justify-between items-center gap-4">
                      <div className="flex flex-col min-w-0 flex-1">
                        <Link to={`/product/${item.productId}`} className="text-[13px] font-semibold text-gray-800 line-clamp-1 hover:text-blue-600 no-underline transition-colors leading-snug">
                          {item.productName}
                        </Link>
                        <span className="text-[11px] text-gray-400 bg-gray-50 w-fit px-1.5 py-0.5 rounded border border-gray-200/60 mt-1">
                          {item.variantInfo}
                        </span>
                      </div>
                      <div className="shrink-0 flex flex-col items-end">
                        <span className="text-[13px] font-bold text-gray-700">{formatCurrency(item.price)}</span>
                        <span className="text-xs text-gray-400 font-semibold mt-0.5">x{item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* KHỐI 3: PHƯƠNG THỨC THANH TOÁN & BẢNG BILL TÍNH TIỀN */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden grid grid-cols-1 md:grid-cols-2">
              <div className="p-4 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-start">
                <div className="flex items-center gap-1.5 text-blue-600 mb-2">
                  <CreditCard size={16} />
                  <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wide m-0">Hình thức thanh toán</h3>
                </div>
                <p className="text-xs font-bold text-gray-700 m-0 leading-normal">
                  {order.paymentMethod === 'COD' ? 'Thanh toán tiền mặt khi nhận hàng (COD)' : `Thanh toán qua cổng trực tuyến (${order.paymentMethod})`}
                </p>
              </div>

              <div className="p-4 bg-gray-50/30 space-y-2">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Tổng tiền hàng</span>
                  <span className="font-medium text-gray-800">{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium text-gray-800">{formatCurrency(order.shippingFee)}</span>
                </div>
                <div className="w-full h-px bg-gray-200/60 my-1.5"></div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-800">Thành tiền thanh toán</span>
                  <span className="text-xl font-bold text-red-600 leading-none">{formatCurrency(order.finalAmount)}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <CancelOrderModal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} orderCode={order.code} />
      </div>
    </>
  );
}