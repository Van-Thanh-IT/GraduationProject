import React from 'react';
import { User, MapPin, Copy, Check } from 'lucide-react';

export const OrderCustomerInfo = ({ order, handleCopy, copiedField }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
          <User size={16} className="text-blue-500"/> Khách hàng
        </h3>
        <p className="font-medium text-gray-800">{order.customerName}</p>
        <p className="text-sm text-gray-600 mt-1">{order.customerPhone}</p>
      </div>
      
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative">
        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
          <MapPin size={16} className="text-red-500"/> Giao hàng tới
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          {order.fullShippingAddress || `${order.shippingAddress}, ${order.shippingWard}, ${order.shippingDistrict}, ${order.shippingCity}`}
        </p>
        
        {order.trackingNumber && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-1">
            <span className="text-xs text-gray-500">Mã vận đơn ({order.shippingCarrier}):</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{order.trackingNumber}</span>
              <button onClick={() => handleCopy(order.trackingNumber, 'mã vận đơn')} className="text-gray-400 hover:text-indigo-600 transition-colors">
                {copiedField === 'mã vận đơn' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        )}

        {order.note && (
          <p className="text-sm text-orange-600 mt-2 bg-orange-50 p-2 rounded italic border border-orange-100">Ghi chú: {order.note}</p>
        )}
      </div>
    </div>
  );
};