import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { X, Receipt, Copy, Check } from 'lucide-react';

// Import các file con
import { OrderCustomerInfo } from './OrderCustomerInfo';
import { OrderProductList } from './OrderProductList';
import { OrderSummary } from './OrderSummary';
import { OrderActionFooter } from './OrderActionFooter';

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

export const OrderDetailModal = ({ isOpen, onClose, order, onCancelOrder, onConfirmOrder, onPackOrder }) => {
  
  const [activeAction, setActiveAction] = useState(null); 
  const [cancelReason, setCancelReason] = useState('');
  const [copiedField, setCopiedField] = useState(null);

  // CHỈ CÒN LƯU STATE SERIALS (Đúng chuẩn Object {} để mapping với Map<> bên Java)
  const [packData, setPackData] = useState({ 
      serials: {} 
  });

  useEffect(() => {
    setActiveAction(null);
    setCancelReason('');
    setCopiedField(null);
    // Reset lại state khi mở/đóng modal để không bị dính mã Serial của đơn cũ
    setPackData({ serials: {} });
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const itemsList = order.orderItems || order.items || [];

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    message.success(`Đã copy ${field}!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmCancel = () => {
    if (!cancelReason.trim()) {
      message.warning("Vui lòng nhập lý do hủy đơn!");
      return;
    }
    // Gọi prop truyền từ Component cha
    onCancelOrder(order.code, cancelReason);
  };

  const handleConfirmPack = () => {
    // === VALIDATE CHẶT CHẼ THEO IS_SERIAL ===
    for (const item of itemsList) {
        const variantId = item.productVariantId || item.variantId || item.id;
        const scannedList = packData.serials[variantId] || [];
        
        // FIX: Đón đầu cả 2 trường hợp tên biến Backend có thể trả về
        const isRequireSerial = item.isSerialRequired;

        if (isRequireSerial) {
           // NẾU BẮT BUỘC CÓ MÃ: Kiểm tra phải quét đủ
           if (scannedList.length !== item.quantity) {
               message.error(`❌ BẮT BUỘC: "${item.productName}" phải quét ĐỦ ${item.quantity} mã! Bạn mới quét ${scannedList.length}/${item.quantity} mã.`);
               return; // Dừng toàn bộ hàm, không gọi API
           }
        } 
    }

    // Nếu lọt qua vòng for an toàn -> Đẩy payload chuẩn xuống backend
    // Format gửi đi: { serials: { "101": ["IMEI-ABC"], "102": ["SN-XYZ"] } }
    onPackOrder(order.id, packData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* ================= HEADER ================= */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Receipt size={20} /></div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">
                  Chi tiết đơn: <span className="text-blue-600">{order.code}</span>
                </h2>
                <button onClick={() => handleCopy(order.code, 'mã đơn')} className="text-gray-400 hover:text-blue-600 transition-colors">
                  {copiedField === 'mã đơn' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
              <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>
          <button onClick={onClose} disabled={activeAction !== null} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50">
            <X size={20} />
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 custom-scrollbar flex flex-col gap-6">
          <OrderCustomerInfo order={order} handleCopy={handleCopy} copiedField={copiedField} />
          
          <OrderProductList 
            itemsList={itemsList} 
            activeAction={activeAction} 
            packData={packData} 
            setPackData={setPackData} 
            formatCurrency={formatCurrency} 
          />
          
          <OrderSummary order={order} formatCurrency={formatCurrency} />
        </div>

        {/* ================= FOOTER ================= */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-white">
          <OrderActionFooter 
            order={order}
            activeAction={activeAction}
            setActiveAction={setActiveAction}
            packData={packData}
            setPackData={setPackData}
            cancelReason={cancelReason}
            setCancelReason={setCancelReason}
            handleConfirmCancel={handleConfirmCancel}
            handleConfirmPack={handleConfirmPack}
            onConfirmOrder={onConfirmOrder}
            onClose={onClose}
          />
        </div>

      </div>
    </div>
  );
};