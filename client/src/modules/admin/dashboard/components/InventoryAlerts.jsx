import React from 'react';
import { Empty } from 'antd';
import { AlertTriangle, PackageMinus } from 'lucide-react';


const formatAlertMessage = (msg) => {
  if (!msg) return null;
  const parts = msg.split(/(\[.*?\]|\(.*?\))/g);
  
  return parts.map((part, index) => {
    // 1. Tô đậm tên sản phẩm trong dấu ngoặc vuông
    if (part.startsWith('[') && part.endsWith(']')) {
      return <strong key={index} className="text-slate-800 font-bold">{part.slice(1, -1)}</strong>;
    }
    // 2. Biến số lượng thành nhãn đỏ nổi bật
    if (part.startsWith('(') && part.endsWith(')')) {
      const numMatch = part.match(/\d+/);
      const num = numMatch ? numMatch[0] : '0';
      return (
        <span key={index} className="inline-block mt-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-xs font-black border border-rose-200">
          Tồn kho: {num}
        </span>
      );
    }
    return <span key={index} className="text-slate-500">{part}</span>;
  });
};

export default function InventoryAlerts({ alerts }) {
  const hasAlerts = alerts && alerts.length > 0;

  return (
    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 tracking-tight">
            Cảnh Báo Kho
          </h3>
          <p className="text-[13px] font-medium text-slate-400 mt-1">Các mặt hàng cần nhập thêm</p>
        </div>
        <div className="bg-rose-50 text-rose-600 flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-xl border border-rose-100 shadow-sm">
          <AlertTriangle size={16} strokeWidth={2.5} className={hasAlerts ? "animate-pulse" : ""} />
          <span className="text-sm">{alerts?.length || 0}</span>
        </div>
      </div>
      
      {/* Set chiều cao cố định hoặc max-height để vừa vặn với layout chứa biểu đồ */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[500px]">
        {hasAlerts ? (
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div 
                key={index} 
                className="p-3.5 bg-white border border-rose-100/80 hover:border-rose-300 rounded-2xl flex items-start gap-3 transition-all hover:bg-rose-50/50 hover:shadow-sm group"
              >
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                  <PackageMinus size={16} className="text-rose-600" strokeWidth={2.5} />
                </div>
                <div className="flex-1 text-[13.5px] leading-relaxed">
                  {formatAlertMessage(alert.message)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center min-h-[200px]">
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description={<span className="text-slate-400 font-medium text-[14px]">Kho hàng đang hoạt động ổn định</span>} 
            />
          </div>
        )}
      </div>
    </div>
  );
}