// File: src/pages/Dashboard/components/CategoryChart.jsx
import React from 'react';
import { Empty } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { formatNumber } from '@/utils/format';

// Định nghĩa mảng màu đẹp mắt cho từng phần của biểu đồ tròn
const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

export default function CategoryChart({ data }) {
  const hasData = data && data.length > 0 && data.some(item => item.revenue > 0);

  return (
    <div className="bg-white p-6 md:p-7 rounded-[24px] shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow h-full">
      <div >
        <h3 className="text-xl font-black text-slate-800 tracking-tight">Tỷ Trọng Danh Mục</h3>
        <p className="text-[13px] font-medium text-slate-400 mt-1">Doanh thu theo từng loại sản phẩm</p>
      </div>
      
      <div className="flex-1 min-h-[300px] w-full relative">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="revenue"
                nameKey="categoryName"
                cx="50%"
                cy="50%"
                innerRadius={70} 
                outerRadius={105}
                paddingAngle={2}
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              
              <RechartsTooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const cellData = payload[0].payload;
                    return (
                      <div className="bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-700">
                        <p className="text-slate-400 text-[11px] font-bold mb-1.5 uppercase tracking-wider">
                          {cellData.categoryName}
                        </p>
                        <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">
                          {formatNumber(cellData.revenue)} <span className="text-[11px] font-bold text-slate-400 ml-0.5">VNĐ</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '13px', fontWeight: 500, color: '#475569' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center absolute inset-0">
            <Empty description={<span className="text-slate-400 font-medium text-[14px]">Chưa có dữ liệu danh mục</span>} />
          </div>
        )}
      </div>
    </div>
  );
}