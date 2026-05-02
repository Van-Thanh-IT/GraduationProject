import React from 'react';
import { Empty } from 'antd';
import { AlertTriangle } from 'lucide-react';

export default function InventoryAlerts({ alerts }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <div className="p-1.5 bg-rose-100 rounded-lg text-rose-500"><AlertTriangle size={18} strokeWidth={2.5} /></div>
            Cảnh Báo Kho
          </h3>
        </div>
        <span className="bg-rose-50 text-rose-600 text-xs font-black px-2.5 py-1 rounded-lg border border-rose-100">
          {alerts?.length || 0} Mục
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[320px] space-y-3">
        {alerts && alerts.length > 0 ? (
          alerts.map((alert, index) => (
            <div key={index} className="p-3.5 bg-rose-50/50 border border-rose-100 rounded-2xl flex items-start gap-3 transition-colors hover:bg-rose-50">
              <div className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0 animate-pulse"></div>
              <p className="text-sm text-slate-700 font-medium leading-snug">{alert.message}</p>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className="text-slate-400 font-medium">Kho hàng đang hoạt động ổn định</span>} />
          </div>
        )}
      </div>
    </div>
  );
}