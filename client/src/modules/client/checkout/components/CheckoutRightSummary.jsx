// File: src/modules/client/checkout/components/CheckoutRightSummary.jsx
import React, { useEffect } from 'react';
import { SafetyCertificateFilled, ThunderboltFilled } from '@ant-design/icons';
import { message, Spin } from 'antd';
import { formatCurrency } from '@/utils/format';
import { useCountdown } from '@/hooks/useCountdown';
import VoucherSelection from './VoucherSelection'; 

const CheckoutCountdown = ({ endTime }) => {
  const { hours, minutes, seconds, isExpired } = useCountdown(endTime);
  if (isExpired) return null; 
  return (
    <div className="flex items-center gap-1 mt-1 text-red-500">
      <span className="text-[11px] font-medium">Kết thúc:</span>
      <div className="flex items-center gap-0.5">
        <span className="bg-red-50 text-red-600 px-1 rounded font-mono text-[11px] font-bold">{hours}</span>
        <span className="text-red-500 font-bold text-[10px]">:</span>
        <span className="bg-red-50 text-red-600 px-1 rounded font-mono text-[11px] font-bold">{minutes}</span>
        <span className="text-red-500 font-bold text-[10px]">:</span>
        <span className="bg-red-50 text-red-600 px-1 rounded font-mono text-[11px] font-bold">{seconds}</span>
      </div>
    </div>
  );
};

export default function CheckoutRightSummary({ 
  checkoutItems, 
  subTotal, 
  shippingFee, 
  totalAmount, 
  isReadyToSubmit,
  voucherDiscount,
  setVoucherDiscount,
  voucherCode,     
  setVoucherCode,  
  onPlaceOrder,
  isPlacingOrder
}) {

  useEffect(() => {
    if (voucherDiscount > 0) {
       setVoucherDiscount(0);
       setVoucherCode('');
       message.info("Đơn hàng thay đổi, voucher đã bị gỡ. Vui lòng chọn lại!");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subTotal]);
 
  return (
    <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-200 flex flex-col gap-4 font-sans sticky top-32" style={{ top: "calc(var(--header-height) + 16px)" }}>
      <h3 className="text-[16px] font-bold text-gray-800 uppercase m-0 tracking-wide">Chi tiết đơn hàng</h3>
      
      {/* 1. DANH SÁCH SẢN PHẨM PHẲNG */}
      <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1 border-y border-gray-100 py-3">
        {checkoutItems.map(item => {
          const isFlashSale = item.flashSale !== null && item.flashSale !== undefined;
          return (
            <div key={item.itemId} className="flex items-start gap-3">
              <div className="w-12 h-12 shrink-0 rounded-lg border border-gray-100 p-1 relative bg-white">
                <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-contain" />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gray-800 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                  {item.quantity}
                </span>
              </div>

              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[13px] font-medium text-gray-800 line-clamp-1 leading-snug">
                  {item.productName}
                </span>
                
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                    {item.options}
                  </span>
                  {isFlashSale && (
                    <span className="px-1.5 py-0.5 bg-red-50 border border-red-100 text-red-600 text-[9px] font-bold uppercase rounded flex items-center gap-0.5">
                      ⚡ Deal
                    </span>
                  )}
                </div>

                {isFlashSale && item.flashSale.endTime && (
                   <CheckoutCountdown endTime={item.flashSale.endTime} />
                )}
                
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-[13px] font-bold ${isFlashSale ? 'text-orange-600' : 'text-red-600'}`}>
                    {formatCurrency(item.price)} 
                  </span>
                  <span className="text-[11px] text-gray-400">x{item.quantity}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. COMPONENT CHỌN VOUCHER */}
      <VoucherSelection 
        subTotal={subTotal}
        setVoucherDiscount={setVoucherDiscount}
        currentVoucherCode={voucherCode} 
        setVoucherCode={setVoucherCode}  
      />
      
      {/* 3. BẢNG TÍNH TIỀN (BILL) */}
      <div className="space-y-2 pt-1 border-t border-gray-100">
        <div className="flex justify-between items-center text-[13px]">
           <span className="text-gray-500">Tạm tính hàng hóa</span>
           <span className="font-semibold text-gray-800">{formatCurrency(subTotal)}</span>
        </div>
        
        <div className="flex justify-between items-center text-[13px]">
           <span className="text-gray-500">Phí vận chuyển</span>
           <span className="font-semibold text-gray-800">
             {shippingFee !== null ? formatCurrency(shippingFee) : '---'}
           </span>
        </div>

        {voucherDiscount > 0 && (
          <div className="flex justify-between items-center text-[13px]">
             <span className="text-green-600 font-medium">Voucher giảm giá</span>
             <span className="font-bold text-green-600">- {formatCurrency(voucherDiscount)}</span>
          </div>
        )}
      </div>

      {/* TỔNG THANH TOÁN */}
      <div className="flex justify-between items-end pt-3 border-t border-gray-100">
         <div className="flex flex-col">
            <span className="text-[14px] font-bold text-gray-800">Tổng thanh toán</span>
            <span className="text-[11px] text-gray-400">Đã bao gồm VAT (nếu có)</span>
         </div>
         <span className="text-[22px] font-bold text-red-600 leading-none">
           {formatCurrency(totalAmount)}
         </span>
      </div>

      {/* 4. NÚT ĐẶT HÀNG PHẲNG THEO HOÀNG HÀ MOBILE */}
      <button 
        type="button"
        disabled={!isReadyToSubmit || isPlacingOrder} 
        onClick={onPlaceOrder}
        className="w-full h-11 bg-red-500 text-white text-[14px] font-bold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 uppercase tracking-wide"
      >
         {isPlacingOrder && <Spin size="small" className="text-white brightness-200" />}
         {isPlacingOrder ? "Đang xử lý..." : "Đặt hàng ngay"}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-[12px] text-gray-400 font-medium">
         <SafetyCertificateFilled className="text-green-500 text-base" />
         Giao dịch an toàn & bảo mật 100%
      </div>
    </div>
  );
}