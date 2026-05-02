import React from 'react';
import { Empty } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { formatNumber } from '@/utils/format';

export default function RevenueChart({ data }) {
  return (
    <div className="xl:col-span-2 bg-white p-6 md:p-7 rounded-[24px] shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Doanh Thu 7 Ngày Qua</h3>
          <p className="text-[13px] font-medium text-slate-400 mt-1">Biểu đồ thể hiện biến động dòng tiền</p>
        </div>
      </div>
      
      <div className="flex-1 min-h-[320px] w-full mt-2">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {/* Đổi từ AreaChart sang BarChart, cấu hình độ rộng của cột (barSize) */}
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={36}>
              
              {/* Định nghĩa dải màu Gradient rực rỡ cho các cột */}
              <defs>
                <linearGradient id="colorRevenueBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/> {/* Tím violet */}
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={1}/> {/* Xanh blue */}
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
              
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} 
                dy={15} 
              />
              
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} 
                tickFormatter={(value) => `${value / 1000000}M`} 
                dx={-10}
              />
              
              <RechartsTooltip 
                cursor={{ fill: '#f8fafc' }} // Màu nền nhạt khi hover vào cột
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-700">
                        <p className="text-slate-400 text-[11px] font-bold mb-1.5 uppercase tracking-wider">{label}</p>
                        {/* Text doanh thu cũng được đổ màu gradient cho đồng bộ */}
                        <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">
                          {formatNumber(payload[0].value)} <span className="text-[11px] font-bold text-slate-400 ml-0.5">VNĐ</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              
              {/* Vẽ cột: Áp dụng màu Gradient và bo tròn 2 góc trên (radius) */}
              <Bar 
                dataKey="revenue" 
                fill="url(#colorRevenueBar)" 
                radius={[8, 8, 0, 0]} 
                animationDuration={1500}
                animationEasing="ease-out"
              />
              
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <Empty description={<span className="text-slate-400 font-medium text-[14px]">Chưa có dữ liệu giao dịch tuần này</span>} />
          </div>
        )}
      </div>
    </div>
  );
}