import React from 'react';
import { Box, Barcode } from 'lucide-react';
import { Select } from 'antd';
import { toast } from 'react-toastify';

export const OrderProductList = ({ itemsList, activeAction, packData, setPackData, formatCurrency }) => {
  return (
    <div className="flex flex-col gap-4">
      {/* 1. Danh sách sản phẩm cơ bản */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box size={16} className="text-indigo-500"/>
            <h3 className="text-sm font-bold text-gray-700">Sản phẩm đã đặt</h3>
          </div>
          <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
            {itemsList?.length || 0} SP
          </span>
        </div>
        
        <div className="divide-y divide-gray-50">
          {itemsList?.map((item) => (
            <div key={item.id} className="p-4 flex gap-4 items-center hover:bg-gray-50/50 transition-colors">
              {/* Hình ảnh */}
              <div className="w-16 h-16 bg-white rounded-lg flex-shrink-0 border border-gray-200 overflow-hidden shadow-sm">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt={item.productName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Box size={24}/>
                  </div>
                )}
              </div>
              
              {/* Thông tin sản phẩm (min-w-0 giúp truncate text không bị đẩy layout) */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="font-semibold text-gray-800 text-sm truncate" title={item.productName}>
                  {item.productName}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  {item.sku && (
                    <span className="text-[11px] text-gray-600 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded font-mono truncate max-w-full" title={`SKU: ${item.sku}`}>
                      SKU: {item.sku}
                    </span>
                  )}
                  {item.variantInfo && (
                    <span className="text-[11px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded truncate max-w-full" title={item.variantInfo}>
                      {item.variantInfo}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Đơn giá & Số lượng */}
              <div className="text-right flex-shrink-0 w-24">
                <p className="font-medium text-gray-800 text-sm">{formatCurrency(item.price)}</p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">x {item.quantity}</p>
              </div>
              
              {/* Tổng tiền */}
              <div className="w-28 text-right font-bold text-blue-600 flex-shrink-0 text-sm">
                {formatCurrency(item.totalPrice)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Khu vực quét mã Serial (Chỉ hiện khi bấm Đóng gói) */}
      {activeAction === 'PACK' && (
        <div className="bg-indigo-50/80 p-5 rounded-xl border border-indigo-200 shadow-inner animate-in fade-in slide-in-from-bottom-2">
          <h4 className="text-sm font-bold text-indigo-800 mb-4 flex items-center gap-2">
            <Barcode size={18} /> Quét mã Serial/IMEI đóng gói
          </h4>
          <div className="flex flex-col gap-4">
            {itemsList?.map((item) => {
              const vId = item.variantId || item.id; 
              const isRequireSerial = item.isSerialRequired; 

              return (
                <div key={vId} className={`flex flex-col gap-2 p-4 rounded-lg shadow-sm border ${isRequireSerial ? 'bg-white border-blue-200' : 'bg-gray-50 border-gray-200 opacity-80'}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-gray-700 block truncate" title={item.productName}>
                        {item.productName} 
                        {isRequireSerial && <span className="text-rose-500 ml-1" title="Bắt buộc quét mã">*</span>}
                      </span>
                      {item.sku && (
                        <span className="text-xs text-gray-500 font-mono mt-0.5 inline-block">
                          Mã: {item.sku}
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap flex-shrink-0 ${isRequireSerial ? 'text-blue-600 bg-blue-100' : 'text-gray-600 bg-gray-200'}`}>
                      SL cần đóng: {item.quantity}
                    </span>
                  </div>
                  
                  {isRequireSerial ? (
                    <Select
                      mode="tags"
                      className="w-full mt-1"
                      style={{ minHeight: '40px' }}
                      placeholder={`Dùng súng quét ĐÚNG ${item.quantity} mã vạch vào đây...`}
                      tokenSeparators={[',', '\n', ' ']} 
                      value={packData.serials ? packData.serials[vId] : []}
                      onChange={(values) => {
                        if (values.length > item.quantity) {
                          toast.error(`Khách chỉ đặt ${item.quantity} sản phẩm! Không được quét thừa!`);
                          return;
                        }
                        setPackData({
                          ...packData,
                          serials: { 
                            ...packData.serials, 
                            [vId]: values 
                          }
                        });
                      }}
                      notFoundContent={null}
                    />
                  ) : (
                    <div className="text-xs text-gray-500 italic bg-gray-100 p-2 mt-1 rounded border border-gray-200">
                      Sản phẩm này không quản lý Serial/IMEI. Bỏ qua.
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  );
};