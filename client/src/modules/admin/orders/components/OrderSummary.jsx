import React from 'react';

export const OrderSummary = ({ order, formatCurrency }) => {
  return (
    <div className="flex justify-end">
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm w-full md:w-80 space-y-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Tổng tiền hàng:</span>
          <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Phí vận chuyển:</span>
          <span className="font-medium">{formatCurrency(order.shippingFee)}</span>
        </div>
        {order.discountAmount > 0 && (
          <div className="flex justify-between text-sm text-rose-500">
            <span>Mã giảm giá:</span>
            <span className="font-medium">-{formatCurrency(order.discountAmount)}</span>
          </div>
        )}
        <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
          <span className="font-bold text-gray-800">Khách phải trả:</span>
          <span className="text-lg font-bold text-blue-600">{formatCurrency(order.finalAmount)}</span>
        </div>
      </div>
    </div>
  );
};