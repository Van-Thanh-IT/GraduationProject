// File: src/pages/Dashboard/Dashboard.jsx
import React, { useState } from 'react';
import { Spin, DatePicker } from 'antd';
import { DollarSign, ShoppingCart, Users, Package, Calendar } from 'lucide-react';
import moment from 'moment';
import 'moment/locale/vi';

import { useGetDashboard } from '@/hooks/useGetDashboard';
import { formatNumber } from '@/utils/format';

import KpiCard from './components/KpiCard';
import RevenueChart from './components/RevenueChart';
import CategoryChart from './components/CategoryChart';
import InventoryAlerts from './components/InventoryAlerts';
import RecentOrders from './components/RecentOrders';
import RecentReviews from './components/RecentReviews';

moment.locale('vi');
const { RangePicker } = DatePicker;

export default function Dashboard() {
  const [dateRange, setDateRange] = useState(null);

  const startDate = dateRange?.[0] ? dateRange[0].format('YYYY-MM-DD') : undefined;
  const endDate = dateRange?.[1] ? dateRange[1].format('YYYY-MM-DD') : undefined;

  const { data, isLoading } = useGetDashboard({ startDate, endDate });

  const disabledFutureDate = (current) => {
    return current && current > moment().endOf('day');
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center bg-slate-50/50">
        <Spin size="large" tip={<span className="text-slate-500 font-medium ml-3">Đang đồng bộ dữ liệu...</span>} />
      </div>
    );
  }

  const { 
    kpis = {}, 
    revenueChart = [], 
    categoryChart = [],
    alerts = [], 
    recentOrders = [], 
    recentReviews = [] 
  } = data || {};

  return (
    <div className=" max-w-[1600px] mx-auto flex flex-col gap-4 bg-slate-50/30 min-h-[calc(100vh-64px)] font-sans">
      
      {/* ================= HEADER & LỌC ================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-3 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 m-0 px-2">Tổng Quan Thống Kê</h2>
        <div className="flex items-center gap-2">
          <Calendar className="text-slate-400 w-5 h-5" />
          <RangePicker 
            format="DD/MM/YYYY"
            onChange={(dates) => setDateRange(dates)}
            disabledDate={disabledFutureDate}
            className="h-10 rounded-lg border-slate-200 hover:border-blue-400 shadow-sm min-w-[250px]"
            placeholder={['Từ ngày', 'Đến ngày']}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Tổng Doanh Thu" value={`${formatNumber(kpis.totalRevenue)} đ`} icon={<DollarSign size={20} strokeWidth={2.5} />} color="blue" trend={kpis.revenueGrowth} />
        <KpiCard title="Đơn Hàng Mới" value={formatNumber(kpis.newOrders)} icon={<ShoppingCart size={26} strokeWidth={2.5} />} color="emerald" />
        <KpiCard title="Khách Hàng Mới" value={formatNumber(kpis.totalCustomers)} icon={<Users size={26} strokeWidth={2.5} />} color="indigo" />
        <KpiCard title="Sản Phẩm Đã Bán" value={formatNumber(kpis.productsSold)} icon={<Package size={26} strokeWidth={2.5} />} color="orange" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
           <RevenueChart data={revenueChart} />
        </div>
        <div className="xl:col-span-1">
           <CategoryChart data={categoryChart} />
        </div>
      </div>

      <div className="w-full">
         <RecentOrders orders={recentOrders} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <RecentReviews reviews={recentReviews} />
        <InventoryAlerts alerts={alerts} />
      </div>

    </div>
  );
}