// File: src/modules/admin/dashboard/components/KpiCard.jsx
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function KpiCard({ title, value, icon, color = 'blue', trend }) {
  // Bảng màu Gradient đậm đà, rực rỡ bám sát hình ảnh tham khảo
  const colorStyles = {
    blue: { // Tương đương thẻ màu Hồng - Tím 
      bg: 'bg-gradient-to-br from-fuchsia-500 to-purple-600',
      shadow: 'shadow-purple-500/40'
    },
    emerald: { // Tương đương thẻ Xanh ngọc - Xanh lá
      bg: 'bg-gradient-to-br from-emerald-400 to-teal-500',
      shadow: 'shadow-teal-500/40'
    },
    indigo: { // Tương đương thẻ Cam - Hồng
      bg: 'bg-gradient-to-br from-orange-400 to-rose-500',
      shadow: 'shadow-rose-500/40'
    },
    orange: { // Tương đương thẻ Xanh mạ - Xanh lục
      bg: 'bg-gradient-to-br from-lime-400 to-green-500',
      shadow: 'shadow-green-500/40'
    }
  };

  const style = colorStyles[color] || colorStyles.blue;
  
  const hasTrend = trend !== undefined && trend !== null;
  const isPositiveTrend = hasTrend && parseFloat(trend) >= 0;

  return (
    <div className={`p-6 md:p-7 rounded-[24px] shadow-lg ${style.shadow} ${style.bg} flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 text-white border border-white/10`}>
      
      {/* 1. Đồ họa nền (Tạo chiều sâu cho thẻ) */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-colors duration-500"></div>
      <div className="absolute -left-8 -bottom-8 w-24 h-24 rounded-full bg-black/10 blur-xl opacity-50"></div>
      
      <div className="flex items-start justify-between mb-4 relative z-10">
        
        {/* 2. Khối Icon với hiệu ứng Kính mờ (Glassmorphism) */}
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-white/20 backdrop-blur-md border border-white/20 shadow-inner group-hover:scale-110 transition-transform duration-300 ease-out">
          {icon}
        </div>
        
        {/* 3. Badge phần trăm tăng/giảm (Cũng dùng kính mờ) */}
        {hasTrend && (
          <div className="flex items-center gap-1.5 text-[12px] font-black px-2.5 py-1.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 shadow-sm">
            {isPositiveTrend ? '+' : ''}{trend}%
            {isPositiveTrend ? (
              <TrendingUp size={14} strokeWidth={3} />
            ) : (
              <TrendingDown size={14} strokeWidth={3} />
            )}
          </div>
        )}
      </div>

      {/* 4. Nội dung Text */}
      <div className="relative z-10 mt-2">
        <h3 className="text-2xl lg:text-[28px] font-black mb-1.5 tracking-tight truncate drop-shadow-md">
          {value}
        </h3>
        <p className="text-[13px] font-bold text-white/80 uppercase tracking-wider truncate">
          {title}
        </p>
      </div>
      
    </div>
  );
}