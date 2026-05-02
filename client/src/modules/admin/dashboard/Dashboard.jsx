import React from 'react';
import { Spin } from 'antd';
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import moment from 'moment';
import 'moment/locale/vi';

import { useGetDashboard } from '@/hooks/useGetDashboard';
import { formatNumber } from '@/utils/format';

// Import các sub-components
import KpiCard from './components/KpiCard';
import RevenueChart from './components/RevenueChart';
import InventoryAlerts from './components/InventoryAlerts';
import RecentOrders from './components/RecentOrders';
import RecentReviews from './components/RecentReviews';

moment.locale('vi');

export default function Dashboard() {
  const { data, isLoading } = useGetDashboard();

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
    alerts = [], 
    recentOrders = [], 
    recentReviews = [] 
  } = data || {};

  return (
    <div className="p-4 md:p-4 lg:p-2 max-w-[1600px] mx-auto space-y-6 lg:space-y-8 bg-slate-50/30 min-h-screen">
      
      {/* ================= KHU VỰC 1: KPI CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        <KpiCard 
          title="Tổng Doanh Thu" 
          value={`${formatNumber(kpis.totalRevenue)} đ`} 
          icon={<DollarSign size={26} strokeWidth={2.5} />} 
          color="blue"
          trend={kpis.revenueGrowth}
        />
        <KpiCard 
          title="Đơn Hàng Mới" 
          value={formatNumber(kpis.newOrders)} 
          icon={<ShoppingCart size={26} strokeWidth={2.5} />} 
          color="emerald"
        />
        <KpiCard 
          title="Khách Hàng Mới" 
          value={formatNumber(kpis.totalCustomers)} 
          icon={<Users size={26} strokeWidth={2.5} />} 
          color="indigo"
        />
        <KpiCard 
          title="Sản Phẩm Đã Bán" 
          value={formatNumber(kpis.productsSold)} 
          icon={<Package size={26} strokeWidth={2.5} />} 
          color="orange"
        />
      </div>

      {/* ================= KHU VỰC 2: BIỂU ĐỒ & CẢNH BÁO ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <RevenueChart data={revenueChart} />
        <InventoryAlerts alerts={alerts} />
      </div>

      {/* ================= KHU VỰC 3: ĐƠN HÀNG & ĐÁNH GIÁ ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <RecentOrders orders={recentOrders} />
        <RecentReviews reviews={recentReviews} />
      </div>

    </div>
  );
}