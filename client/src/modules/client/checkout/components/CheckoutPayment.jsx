// File: src/modules/client/checkout/components/CheckoutPayment.jsx
import React from 'react';
import { WalletOutlined, CreditCardOutlined } from '@ant-design/icons';

export default function CheckoutPayment({ paymentMethod, setPaymentMethod }) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
       <h3 className="text-[16px] font-black text-slate-800 mb-5 flex items-center gap-2">
         <WalletOutlined className="text-indigo-500" /> 3. Phương thức thanh toán
       </h3>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            onClick={() => setPaymentMethod('COD')}
            className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col gap-2 ${paymentMethod === 'COD' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-indigo-300'}`}
          >
             <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
                <WalletOutlined />
             </div>
             <span className="font-bold text-slate-800">Thanh toán khi nhận hàng</span>
             <span className="text-xs text-slate-500">Kiểm tra hàng trước khi thanh toán (COD)</span>
          </div>

          <div 
            onClick={() => setPaymentMethod('VNPAY')}
            className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col gap-2 ${paymentMethod === 'VNPAY' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-indigo-300'}`}
          >
             <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                <CreditCardOutlined />
             </div>
             <span className="font-bold text-slate-800">Thanh toán qua VNPay</span>
             <span className="text-xs text-slate-500">Quét mã QR, Thẻ ATM, Visa/MasterCard</span>
          </div>
       </div>
    </div>
  );
}