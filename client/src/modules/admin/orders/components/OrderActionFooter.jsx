import React from 'react';
import { Package, AlertCircle, CheckCircle } from 'lucide-react';

export const OrderActionFooter = ({ 
  order, activeAction, setActiveAction, 
  handleConfirmPack, 
  cancelReason, setCancelReason, handleConfirmCancel, 
  onConfirmOrder, onClose 
}) => {

  // UI 1: HỎI LẠI TRƯỚC KHI XÁC NHẬN ĐƠN
  if (activeAction === 'CONFIRM') return (
    <div className="flex items-center justify-between w-full animate-in slide-in-from-right-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
      <div className="flex items-center gap-2 text-blue-700">
        <CheckCircle size={18} />
        <span className="text-sm font-medium">Bạn xác nhận đơn hàng này hợp lệ và sẵn sàng đi nhặt hàng?</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setActiveAction(null)} className="px-4 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">Quay lại</button>
        <button onClick={() => onConfirmOrder(order.id)} className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm">Đồng ý xác nhận</button>
      </div>
    </div>
  );

  // UI 2: ĐÓNG GÓI (Chỉ lưu Serial/IMEI, không dính tới Tracking/Goship)
  if (activeAction === 'PACK') return (
    <div className="flex items-center justify-between w-full animate-in slide-in-from-right-4 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
      <div className="flex items-center gap-2 text-indigo-700">
        <Package size={18} />
        <span className="text-sm font-medium">Bạn đã quét đủ Serial/IMEI và muốn chốt đóng gói đơn hàng này?</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setActiveAction(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Hủy</button>
        <button onClick={handleConfirmPack} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-2">
          Chốt đóng gói <Package size={16} />
        </button>
      </div>
    </div>
  );

  // UI 3: NHẬP LÝ DO HỦY ĐƠN
  if (activeAction === 'CANCEL') return (
    <div className="flex items-center gap-3 w-full animate-in slide-in-from-right-4">
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <AlertCircle size={16} className="text-rose-400" />
        </div>
        <input 
          type="text" 
          placeholder="Ghi rõ lý do hủy đơn (Khách bom, Hết hàng...)" 
          className="w-full pl-9 pr-3 py-2 border border-rose-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-lg outline-none text-sm"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          autoFocus
        />
      </div>
      <button onClick={() => setActiveAction(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Quay lại</button>
      <button onClick={handleConfirmCancel} className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm">Chốt Hủy</button>
    </div>
  );

  // UI 4: MẶC ĐỊNH
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Trạng thái:</span>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
          order.orderStatus === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
          order.orderStatus === 'CONFIRMED' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
          order.orderStatus === 'SHIPPING' || order.orderStatus === 'READY_TO_SHIP' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' :
          order.orderStatus === 'COMPLETED' || order.orderStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
          order.orderStatus === 'RETURNED' ? 'bg-slate-100 text-slate-600 border border-slate-300' :
          'bg-rose-50 text-rose-600 border border-rose-200' 
        }`}>
          {order.orderStatus}
        </span>
        {order.orderStatus === 'CANCELLED' && order.cancelReason && (
          <span className="text-xs text-rose-500 italic ml-2 border-l border-rose-200 pl-2 line-clamp-1 max-w-[200px]">{order.cancelReason}</span>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        {order.orderStatus === 'PENDING' && (
          <button onClick={() => setActiveAction('CONFIRM')} className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">
            <CheckCircle size={16} /> Xác nhận đơn
          </button>
        )}
        {order.orderStatus === 'CONFIRMED' && (
          <button onClick={() => setActiveAction('PACK')} className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm">
            <Package size={16} /> Đóng gói đơn
          </button>
        )}
        {(order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED') && (
          <button onClick={() => setActiveAction('CANCEL')} className="px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
            Hủy đơn
          </button>
        )}
        <button onClick={onClose} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors ml-2">
          Đóng
        </button>
      </div>
    </div>
  );
};