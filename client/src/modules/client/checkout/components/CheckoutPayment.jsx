// File: src/modules/client/checkout/components/CheckoutPayment.jsx
import React from 'react';
import { WalletOutlined } from '@ant-design/icons';
import logo_vnpay  from "@/assets/icons/vnpay.jpg"

export default function CheckoutPayment({ paymentMethod, setPaymentMethod }) {
  return (
    <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-200 font-sans">
       <h3 className="text-[15px] font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-1.5 m-0 uppercase tracking-wide">
         <WalletOutlined className="text-blue-500" /> 3. Phương thức thanh toán
       </h3>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* PHƯƠNG THỨC COD */}
          <div 
            onClick={() => setPaymentMethod('COD')}
            className={`cursor-pointer p-3.5 rounded-lg border transition-colors flex flex-col gap-1 ${
              paymentMethod === 'COD' 
                ? 'border-blue-600 bg-blue-50/30' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
             <div className="w-12 h-6 flex items-center justify-start">
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/6491/6491541.png" 
                  alt="COD" 
                  className="h-full object-contain mix-blend-multiply" 
                />
             </div>
             <span className={`text-[14px] mt-1 ${paymentMethod === 'COD' ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
               Thanh toán khi nhận hàng
             </span>
             <span className="text-xs text-gray-400">Kiểm tra hàng trước khi thanh toán (COD)</span>
          </div>

          {/* PHƯƠNG THỨC VNPAY */}
          <div 
            onClick={() => setPaymentMethod('VNPAY')}
            className={`cursor-pointer p-3.5 rounded-lg border transition-colors flex flex-col gap-1 ${
              paymentMethod === 'VNPAY' 
                ? 'border-blue-600 bg-blue-50/30' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
             <div className="w-12 h-6 flex items-center justify-start">
                <img 
                  src={logo_vnpay}
                  className="h-full object-contain" 
                />
             </div>
             <span className={`text-[14px] mt-1 ${paymentMethod === 'VNPAY' ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
               Thanh toán qua VNPAY
             </span>
             <span className="text-xs text-gray-400">Quét mã QR, Thẻ ATM, Visa/MasterCard</span>
          </div>
       </div>
    </div>
  );
}