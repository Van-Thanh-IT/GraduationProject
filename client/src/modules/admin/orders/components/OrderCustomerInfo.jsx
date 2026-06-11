import React from 'react';
import { 
  User, 
  MapPin, 
  Copy, 
  Check, 
  Mail, 
  Phone, 
  CreditCard, 
  Building2, 
  Truck, 
  FileText, 
  StickyNote
} from 'lucide-react';
import { Button, Tag } from 'antd';

export const OrderCustomerInfo = ({ order, handleCopy, copiedField }) => {
  if (!order) return null;

  // Hàm phụ trợ: Hiển thị tag màu cho trạng thái thanh toán
  const renderPaymentStatus = (status) => {
    switch (status) {
      case 'COMPLETED': return <Tag color="success" className="m-0 font-medium border-0">Đã thanh toán</Tag>;
      case 'PENDING': return <Tag color="warning" className="m-0 font-medium border-0 text-amber-700 bg-amber-50">Chờ thanh toán</Tag>;
      case 'FAILED': return <Tag color="error" className="m-0 font-medium border-0">Thất bại</Tag>;
      default: return <Tag className="m-0 font-medium border-0">{status || 'Chưa rõ'}</Tag>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      
      {/* ================= CỘT TRÁI ================= */}
      <div className="flex flex-col gap-4">
        
        {/* 1. THÔNG TIN KHÁCH HÀNG */}
        <div className="bg-white p-4 lg:p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4">
          <h3 className="text-[15px] font-bold text-gray-800 flex items-center gap-2 m-0 border-b border-gray-50 pb-3">
            <User size={18} className="text-blue-500" /> Thông tin khách hàng
          </h3>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-sm uppercase">{order.customerName?.charAt(0) || 'U'}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-800 text-[15px]">{order.customerName}</span>
                
                <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-1.5">
                  <Phone size={14} className="text-gray-400" />
                  <span className="font-medium">{order.customerPhone}</span>
                </div>
                
                {order.customerEmail && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-1">
                    <Mail size={14} className="text-gray-400" />
                    <span>{order.customerEmail}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. THÔNG TIN THANH TOÁN */}
        <div className="bg-white p-4 lg:p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4">
          <h3 className="text-[15px] font-bold text-gray-800 flex items-center gap-2 m-0 border-b border-gray-50 pb-3">
            <CreditCard size={18} className="text-emerald-500" /> Chi tiết thanh toán
          </h3>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Phương thức:</span>
              <span className="text-sm font-bold text-gray-800 bg-gray-50 px-2 py-1 rounded">
                {order.paymentMethod === 'VNPAY' ? 'VNPay' : (order.paymentMethod || 'COD')}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Trạng thái:</span>
              {renderPaymentStatus(order.paymentStatus)}
            </div>
          </div>
        </div>

      </div>

      {/* ================= CỘT PHẢI ================= */}
      <div className="flex flex-col gap-4">
        
        {/* 3. THÔNG TIN GIAO HÀNG */}
        <div className="bg-white p-4 lg:p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4">
          <h3 className="text-[15px] font-bold text-gray-800 flex items-center gap-2 m-0 border-b border-gray-50 pb-3">
            <Truck size={18} className="text-orange-500" /> Giao hàng tới
          </h3>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed bg-gray-50/50 p-3 rounded-lg border border-gray-50">
              <MapPin size={16} className="text-red-500 mt-0.5 shrink-0" />
              <span>{order.fullShippingAddress || `${order.shippingAddress}, ${order.shippingWard}, ${order.shippingDistrict}, ${order.shippingCity}`}</span>
            </div>
            
            {order.trackingNumber && (
              <div className="flex items-center justify-between bg-indigo-50/50 p-3 rounded-lg border border-indigo-50">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-gray-500 font-medium">Mã vận đơn ({order.shippingCarrier})</span>
                  <span className="text-sm font-bold tracking-wider text-indigo-700">{order.trackingNumber}</span>
                </div>
                <Button 
                  type="default" 
                  onClick={() => handleCopy(order.trackingNumber, 'mã vận đơn')} 
                  className="flex items-center justify-center border-indigo-200 text-indigo-600 hover:text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50" 
                  icon={copiedField === 'mã vận đơn' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />} 
                />
              </div>
            )}

            {order.note && (
              <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100">
                <StickyNote size={16} className="mt-0.5 shrink-0" />
                <span className="italic leading-relaxed"><span className="font-semibold">Ghi chú:</span> {order.note}</span>
              </div>
            )}
          </div>
        </div>

        {/* 4. THÔNG TIN XUẤT HÓA ĐƠN VAT (Chỉ hiện khi isVatRequired = true) */}
        {order.isVatRequired && (
          <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/30 p-4 lg:p-5 rounded-xl border border-blue-100 shadow-sm flex flex-col gap-4">
            <h3 className="text-[15px] font-bold text-blue-800 flex items-center gap-2 m-0 border-b border-blue-100/50 pb-3">
              <FileText size={18} className="text-blue-500" /> Yêu cầu xuất hóa đơn VAT
            </h3>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2.5">
                <Building2 size={16} className="text-blue-400 mt-0.5 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs text-blue-500 font-medium mb-0.5">Tên công ty</span>
                  <span className="text-sm font-bold text-gray-800 leading-snug">{order.companyName}</span>
                </div>
              </div>
              
              <div className="flex items-start gap-2.5">
                <FileText size={16} className="text-blue-400 mt-0.5 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs text-blue-500 font-medium mb-0.5">Mã số thuế</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800 font-mono tracking-widest">{order.taxCode}</span>
                    <Button 
                      type="text" 
                      onClick={() => handleCopy(order.taxCode, 'mã số thuế')} 
                      className="p-1 h-auto text-blue-400 hover:text-blue-600 hover:bg-blue-100" 
                      icon={copiedField === 'mã số thuế' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />} 
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-blue-400 mt-0.5 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs text-blue-500 font-medium mb-0.5">Địa chỉ công ty</span>
                  <span className="text-sm text-gray-700 leading-relaxed">{order.companyAddress}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};