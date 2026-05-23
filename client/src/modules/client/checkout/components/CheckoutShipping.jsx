// File: src/modules/client/checkout/components/CheckoutShipping.jsx
import React from 'react';
import { Spin, Radio } from 'antd';
import { TruckOutlined, CheckCircleFilled } from '@ant-design/icons';
import { formatNumber } from '@/utils/format';

export default function CheckoutShipping({ address, shippingOptions, selectedShipping, setSelectedShipping, isCalculatingShip }) {
  return (
    <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-200 font-sans">
      <h3 className="text-[15px] font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-1.5 m-0 uppercase tracking-wide">
          <TruckOutlined className="text-blue-500" /> 2. Đơn vị vận chuyển
      </h3>

      {isCalculatingShip && (
          <div className="py-8 flex flex-col items-center justify-center">
            <Spin />
            <span className="mt-2 text-gray-400 text-xs font-medium">Đang tìm đơn vị vận chuyển tốt nhất...</span>
          </div>
      )}

      {!address?.ward && !isCalculatingShip && (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-5 text-center text-gray-400 text-sm font-medium">
            Vui lòng chọn đầy đủ địa chỉ để hiển thị các lựa chọn giao hàng.
          </div>
      )}

      {!isCalculatingShip && shippingOptions.length > 0 && (
          <Radio.Group
            className="w-full flex flex-col gap-3" 
            value={selectedShipping?.id}
            onChange={(e) => setSelectedShipping(shippingOptions.find(s => s.id === e.target.value))}
          >
          {shippingOptions.map((carrier) => {
              const isActive = selectedShipping?.id === carrier.id;
              return (
              <label
                  key={carrier.id}
                  className={`relative flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    isActive 
                      ? 'border-blue-600 bg-blue-50/30' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
              >
                  <Radio value={carrier.id} className="absolute opacity-0 pointer-events-none" />

                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-md bg-white flex items-center justify-center p-1 border transition-colors ${isActive ? 'border-blue-200' : 'border-gray-200'}`}>
                        <img src={carrier.carrier_logo || 'https://via.placeholder.com/40'} alt={carrier.carrier_name} className="w-full h-full object-contain mix-blend-multiply" />
                    </div>

                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[14px] ${isActive ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>{carrier.carrier_name}</span>
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded uppercase tracking-wider">{carrier.service}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[12px] text-green-600 font-medium">
                          <TruckOutlined className="text-xs" /> {carrier.expected}
                        </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[15px] font-bold ${isActive ? 'text-red-600' : 'text-gray-700'}`}>
                        {formatNumber(carrier.total_fee)} ₫
                    </span>
                    {isActive && (
                      <CheckCircleFilled className="text-blue-600 text-[16px]" />
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