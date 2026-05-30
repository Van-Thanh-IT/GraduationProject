import React from 'react';
import { Empty } from 'antd';
// Đổi BarChart thành ComposedChart, và import thêm Line
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Rectangle } from 'recharts';
import { formatNumber } from '@/utils/format';

export default function RevenueChart({ data }) {
  const hasData = data && data.length > 0;

  return (
    <div className="xl:col-span-2 bg-white p-6 md:p-7 rounded-[24px] shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Doanh Thu 7 Ngày Qua</h3>
          <p className="text-[13px] font-medium text-slate-400 mt-1">Biểu đồ thể hiện biến động dòng tiền</p>
        </div>
      </div>
      
      <div className="w-full mt-2 relative">
        {hasData ? (
          <ResponsiveContainer width="100%" height={320}>
            {/* Sử dụng ComposedChart để vẽ được cả Cột và Dây */}
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barSize={32}>
              
              <defs>
                <linearGradient id="colorRevenueBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8}/>
                </linearGradient>
                <linearGradient id="colorRevenueBarHover" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={1}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
              
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} 
                dy={10} 
              />
              
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} 
                tickFormatter={(value) => value === 0 ? '0' : `${(value / 1000000).toFixed(0)}M`} 
                dx={-10}
              />
              
              <RechartsTooltip 
                cursor={{ fill: '#f8fafc', opacity: 0.5 }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    // Lấy payload[0] để hiển thị data chính, tránh bị lặp chữ khi có cả Line và Bar
                    const value = payload[0].value;
                    return (
                      <div className="bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-700">
                        <p className="text-slate-400 text-[11px] font-bold mb-1.5 uppercase tracking-wider">Ngày {label}</p>
                        <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                          {value > 0 ? formatNumber(value) : '0'} <span className="text-[11px] font-bold text-slate-400 ml-0.5">VNĐ</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              
              {/* 1. VẼ CỘT TRƯỚC (Nó sẽ nằm dưới) */}
              <Bar 
                dataKey="revenue" 
                fill="url(#colorRevenueBar)" 
                radius={[6, 6, 0, 0]} 
                minPointSize={5} 
                animationDuration={1500}
                animationEasing="ease-out"
                activeBar={<Rectangle fill="url(#colorRevenueBarHover)" />}
              />
              
              {/* 2. VẼ DÂY SAU (Nó sẽ đè lên trên cột, không bao giờ bị che) */}
              <Line 
                type="monotone" // Đường cong mềm mại
                dataKey="revenue" // Đang dùng chung data doanh thu để vẽ xu hướng
                stroke="#f97316" // Màu cam rực rỡ giống ảnh mẫu
                strokeWidth={3} // Độ dày của dây
                dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }} // Các chấm tròn trên dây
                activeDot={{ r: 6, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }} // Chấm tròn to ra khi hover
                animationDuration={1500}
              />
              
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[320px] flex flex-col items-center justify-center">
            <Empty description={<span className="text-slate-400 font-medium text-[14px]">Chưa có dữ liệu giao dịch</span>} />
          </div>
        )}
      </div>
    </div>
  );
}