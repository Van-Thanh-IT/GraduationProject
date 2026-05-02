// File: src/modules/client/checkout/components/CheckoutRightSummary.jsx
import React, { useEffect } from 'react'; // XÓA useState ở đây đi
import { SafetyCertificateFilled, ThunderboltFilled } from '@ant-design/icons';
import { message } from 'antd';

import { formatCurrency } from '@/utils/format';
import { useCountdown } from '@/hooks/useCountdown';
import VoucherSelection from './VoucherSelection'; 

const CheckoutCountdown = ({ endTime }) => {
  const { hours, minutes, seconds, isExpired } = useCountdown(endTime);
  if (isExpired) return null; 
  return (
    <div className="flex items-center gap-0.5 mt-1.5">
      <span className="text-[9.5px] text-orange-500 font-bold mr-1">Kết thúc:</span>
      <span className="bg-orange-100 text-orange-600 px-1 rounded font-mono text-[9px] font-black">{hours}</span>
      <span className="text-orange-400 font-bold text-[9px]">:</span>
      <span className="bg-orange-100 text-orange-600 px-1 rounded font-mono text-[9px] font-black">{minutes}</span>
      <span className="text-orange-400 font-bold text-[9px]">:</span>
      <span className="bg-orange-100 text-orange-600 px-1 rounded font-mono text-[9px] font-black">{seconds}</span>
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
  voucherCode,     // NHẬN TỪ PROPS
  setVoucherCode,  // NHẬN TỪ PROPS
  onPlaceOrder,
  isPlacingOrder
}) {
  // XÓA DÒNG NÀY ĐI: const [voucherCode, setVoucherCode] = useState('');

  // Lắng nghe nếu giỏ hàng thay đổi giá -> Xóa Voucher
  useEffect(() => {
    if (voucherDiscount > 0) {
       setVoucherDiscount(0);
       setVoucherCode('');
       message.info("Đơn hàng thay đổi, voucher đã bị gỡ. Vui lòng chọn lại!");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subTotal]);

  return (
    <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-6 sticky top-24">
      <h3 className="text-lg font-black text-slate-800 uppercase m-0">Chi tiết đơn hàng</h3>
      
      {/* 1. DANH SÁCH SẢN PHẨM */}
      <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-2 border-y border-slate-100 py-4">
        {checkoutItems.map(item => {
          const isFlashSale = item.flashSale !== null && item.flashSale !== undefined;
          return (
            <div key={item.itemId} className="flex items-start gap-3">
              <div className="w-14 h-14 shrink-0 rounded-xl border border-slate-100 p-1 relative bg-white mt-1">
                <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-contain" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-slate-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {item.quantity}
                </span>
                {isFlashSale && (
                  <div className="absolute -bottom-1.5 -left-1.5 bg-gradient-to-br from-orange-400 to-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    <ThunderboltFilled className="text-[9px]" />
                  </div>
                )}
              </div>

              <div className="flex flex-col flex-1 justify-center">
                <span className="text-[13px] font-bold text-slate-800 line-clamp-1 leading-snug">
                  {item.productName}
                </span>
                
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[11px] text-slate-500 font-medium bg-slate-50 px-1.5 py-0.5 rounded">
                    {item.options}
                  </span>
                  {isFlashSale && (
                    <span className="px-1.5 py-0.5 bg-orange-50 border border-orange-200 text-orange-600 text-[8px] font-black uppercase rounded flex items-center gap-0.5">
                      <ThunderboltFilled /> Deal
                    </span>
                  )}
                </div>

                {isFlashSale && item.flashSale.endTime && (
                   <CheckoutCountdown endTime={item.flashSale.endTime} />
                )}
                
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-[13px] font-black ${isFlashSale ? 'text-orange-600' : 'text-rose-600'}`}>
                    {formatCurrency(item.price)} 
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">x{item.quantity}</span>
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
        currentVoucherCode={voucherCode} // Lấy code từ file cha đẩy xuống
        setVoucherCode={setVoucherCode}  // Gán hàm set cho nó cập nhật file cha
      />
      
      {/* 3. BẢNG TÍNH TIỀN (BILL) */}
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center text-[14px]">
           <span className="text-slate-500">Tạm tính hàng hóa</span>
           <span className="font-bold text-slate-800">{formatCurrency(subTotal)}</span>
        </div>
        
        <div className="flex justify-between items-center text-[14px]">
           <span className="text-slate-500">Phí vận chuyển</span>
           <span className="font-bold text-slate-800">
             {shippingFee !== null ? formatCurrency(shippingFee) : '---'}
           </span>
        </div>

        {voucherDiscount > 0 && (
          <div className="flex justify-between items-center text-[14px]">
             <span className="text-emerald-600 font-medium">Voucher giảm giá</span>
             <span className="font-bold text-emerald-600">- {formatCurrency(voucherDiscount)}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-end pt-4 border-t border-slate-100">
         <div className="flex flex-col">
            <span className="text-[15px] font-black text-slate-800">Tổng thanh toán</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Đã bao gồm VAT (nếu có)</span>
         </div>
         <span className="text-[26px] font-black text-rose-600 leading-none">
           {formatCurrency(totalAmount)}
         </span>
      </div>

      {/* 4. NÚT ĐẶT HÀNG */}
     <button 
        disabled={!isReadyToSubmit || isPlacingOrder} 
        onClick={onPlaceOrder}
        className="w-full h-14 mt-2 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[16px] font-black rounded-xl shadow-lg shadow-rose-200 hover:from-rose-600 hover:to-red-700 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
      >
         {isPlacingOrder ? <Spin size="small" className="text-white" /> : null}
         {isPlacingOrder ? "ĐANG XỬ LÝ..." : "ĐẶT HÀNG NGAY"}
      </button>

      <div className="flex items-center justify-center gap-2 text-[12px] text-slate-500 font-medium">
         <SafetyCertificateFilled className="text-emerald-500 text-lg" />
         Giao dịch an toàn & Bảo mật 100%
      </div>
    </div>
  );
}