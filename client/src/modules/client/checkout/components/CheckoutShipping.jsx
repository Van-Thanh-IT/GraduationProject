// File: src/modules/client/checkout/components/CheckoutShipping.jsx
import React from 'react';
import { Spin, Radio } from 'antd';
import { TruckOutlined, CheckCircleFilled } from '@ant-design/icons';
import { formatNumber } from '@/utils/format';

export default function CheckoutShipping({ address, shippingOptions, selectedShipping, setSelectedShipping, isCalculatingShip }) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
      <h3 className="text-[16px] font-black text-slate-800 mb-5 flex items-center gap-2">
          <TruckOutlined className="text-indigo-500" /> 2. Đơn vị vận chuyển
      </h3>

      {isCalculatingShip && (
          <div className="py-10 flex flex-col items-center justify-center">
            <Spin size="large" />
            <span className="mt-2 text-slate-500 animate-pulse">Đang tìm đơn vị vận chuyển tốt nhất...</span>
          </div>
      )}

      {!address?.ward && !isCalculatingShip && (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-sm font-medium">
            Vui lòng chọn đầy đủ địa chỉ để hiển thị các lựa chọn giao hàng.
          </div>
      )}

      {!isCalculatingShip && shippingOptions.length > 0 && (
          <Radio.Group
            className="w-full flex flex-col gap-4" 
            value={selectedShipping?.id}
            onChange={(e) => setSelectedShipping(shippingOptions.find(s => s.id === e.target.value))}
          >
          {shippingOptions.map((carrier) => {
              const isActive = selectedShipping?.id === carrier.id;
              return (
              <label
                  key={carrier.id}
                  className={`relative flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${isActive ? 'border-indigo-600 bg-indigo-50/40 shadow-md shadow-indigo-100' : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-sm'}`}
              >
                  <Radio value={carrier.id} className="absolute opacity-0 pointer-events-none" />

                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center p-1 border transition-colors ${isActive ? 'border-indigo-200' : 'border-slate-100'}`}>
                        <img src={carrier.carrier_logo || 'https://via.placeholder.com/40'} alt={carrier.carrier_name} className="w-full h-full object-contain mix-blend-multiply" />
                    </div>

                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-black text-[14.5px] ${isActive ? 'text-indigo-700' : 'text-slate-800'}`}>{carrier.carrier_name}</span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase tracking-wider">{carrier.service}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[12.5px] text-emerald-600 font-bold">
                          <TruckOutlined className="text-xs" /> {carrier.expected}
                        </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[16px] font-black ${isActive ? 'text-rose-600' : 'text-slate-700'}`}>
                        {formatNumber(carrier.total_fee)} ₫
                    </span>
                    {isActive && (
                        <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                          <CheckCircleFilled className="text-white text-[12px]" />
                        </div>
                    )}
                  </div>
              </label>
              );
          })}
          </Radio.Group>
      )}
    </div>
  );
}