// File: src/modules/client/order/OrderHistoryPage.jsx
import React, { useState } from 'react';
import { Input, Pagination, Spin, Empty } from 'antd';
import { Search, ShoppingBag, Star } from 'lucide-react';
import { useGetMyOrders } from '@/hooks/useOrders';
import { useGetAwaitingReviews } from '@/hooks/useReviews';
import OrderCard from './components/OrderCard';
import CancelOrderModal from './components/CancelOrderModal';
import { useNavigate } from 'react-router-dom';
import ReviewModal from './components/ReviewModal';

const TABS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ xác nhận' },
  { key: 'CONFIRMED', label: 'Đã xác nhận' },
  { key: 'READY_TO_SHIP', label: 'Chờ lấy hàng' },
  { key: 'SHIPPING', label: 'Đang giao' },
  { key: 'DELIVERED', label: 'Đã giao' },
  { key: 'COMPLETED', label: 'Hoàn thành' },
   { key: 'AWAITING_REVIEW', label: 'Chờ đánh giá' },
  { key: 'CANCELLED', label: 'Đã hủy' },
  { key: 'RETURNED', label: 'Trả hàng' },
  // THÊM TAB CHỜ ĐÁNH GIÁ
];

// 1. CHỈ HIỆN SỐ LƯỢNG (BADGE) Ở CÁC TAB NÀY. Các tab khác (Hoàn thành, Hủy) sẽ tự động ẩn
const SHOW_BADGE_TABS = ['PENDING', 'CONFIRMED', 'READY_TO_SHIP', 'SHIPPING', 'AWAITING_REVIEW'];

export default function OrderHistoryPage() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const size = 10; 
  const navigate = useNavigate();

  // State Modal Hủy đơn
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelOrderCode, setCancelOrderCode] = useState('');
  // Khai báo state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState(null);

  // 2. GỌI API ĐƠN HÀNG BÌNH THƯỜNG
  const { data: orderData, isLoading: isOrderLoading, isFetching } = useGetMyOrders({
    status: activeTab !== 'AWAITING_REVIEW' ? activeTab : 'ALL', // Nếu tab chờ đánh giá thì ko truyền status order
    keyword: keyword,
    page: page,
    size: size,
  });

  // 3. GỌI API LẤY SỐ LƯỢNG & DANH SÁCH SẢN PHẨM CHỜ ĐÁNH GIÁ
  const { data: awaitingReviewsData, isLoading: isReviewLoading } = useGetAwaitingReviews();

  const orders = orderData?.content || [];
  const totalElements = orderData?.totalElements || 0;
  const statusSummary = orderData?.statusSummary || {};
  
  // Dữ liệu đánh giá
  const awaitingReviews = awaitingReviewsData || [];
  const awaitingReviewCount = awaitingReviews.length;

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(0);
  };

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100vh-64px)] w-full font-sans pt-6 pb-12">
      <div className="w-full max-w-[1050px] mx-auto px-4 lg:px-0">
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">Đơn hàng của tôi</h1>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="overflow-x-auto custom-scrollbar bg-white border-b border-gray-100">
            <div className="flex w-max min-w-full px-2">
              {TABS.map((tab) => {
                // 4. LẤY SỐ LƯỢNG CHO TỪNG TAB
                const count = tab.key === 'AWAITING_REVIEW' ? awaitingReviewCount : (statusSummary[tab.key] || 0);
                const isActive = activeTab === tab.key;
                
                // KIỂM TRA ĐIỀU KIỆN HIỂN THỊ BADGE (Nằm trong list cho phép & Count > 0)
                const shouldShowBadge = SHOW_BADGE_TABS.includes(tab.key) && count > 0;

                return (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key)}
                    className={`relative px-5 py-4 text-[14px] font-bold whitespace-nowrap transition-all flex items-center justify-center gap-2 border-b-[3px] 
                    ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-500'}`}
                  >
                    {tab.label}
                    {shouldShowBadge && (
                      <span className={`px-1.5 py-0.5 text-[10px] font-black rounded-full min-w-[20px] text-center border shadow-sm transition-colors ${
                        isActive ? 'bg-blue-600 text-white border-blue-600' : 'bg-rose-500 text-white border-white'
                      }`}>
                        {count > 99 ? '99+' : count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ô Tìm kiếm chỉ hiện khi không ở tab Đánh giá */}
          {activeTab !== 'AWAITING_REVIEW' && (
            <div className="p-4 bg-gray-50/50">
              <div className="bg-white rounded-xl p-1 border border-gray-200 focus-within:border-blue-400 transition-all flex items-center">
                <div className="pl-4 pr-2 text-gray-400"><Search size={18} /></div>
                <Input
                  bordered={false}
                  placeholder="Tìm kiếm theo Mã đơn hàng hoặc Tên sản phẩm..."
                  className="text-[15px] py-2 shadow-none bg-transparent font-medium"
                  value={keyword}
                  onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 5. KHU VỰC RENDER DỮ LIỆU */}
        <div className="relative min-h-[400px]">
          {(isFetching || isReviewLoading) && !isOrderLoading && (
            <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[2px] flex justify-center pt-20 rounded-xl">
              <Spin size="large" />
            </div>
          )}

          {activeTab === 'AWAITING_REVIEW' ? (
            /* RENDER GIAO DIỆN CHỜ ĐÁNH GIÁ (SẢN PHẨM LẺ) */
            awaitingReviews.length > 0 ? (
              <div className="flex flex-col gap-4">
                {awaitingReviews.map((item) => (
                  <div key={item.orderItemId} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex gap-4 items-center">
                      <img src={item.thumbnail} alt={item.productName} className="w-20 h-20 object-cover rounded-lg border border-gray-100" />
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm line-clamp-2">{item.productName}</h4>
                        <p className="text-[13px] text-gray-500 mt-1">Phân loại: {item.variantSpecs}</p>
                        <p className="text-[11px] text-gray-400 mt-1">Mua ngày: {new Date(item.orderDate).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                   <button 
                      onClick={() => {
                        setSelectedReviewItem(item);  // Gán data của item vào state
                        setIsReviewModalOpen(true);   // Bật modal lên
                      }}
                      className="w-full sm:w-auto px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg shadow-sm shadow-rose-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Star size={16} /> Đánh giá ngay
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 py-24 flex flex-col justify-center items-center">
                <Empty description={<span className="text-gray-500 font-semibold text-[15px]">Bạn chưa có sản phẩm nào cần đánh giá!</span>} />
              </div>
            )
          ) : (
            /* RENDER DANH SÁCH ĐƠN HÀNG BÌNH THƯỜNG */
            isOrderLoading ? (
              <div className="flex items-center justify-center h-60 bg-white rounded-xl border border-gray-100">
                <Spin size="large" />
              </div>
            ) : orders.length > 0 ? (
              <div className="flex flex-col gap-4">
                {orders.map((order) => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onViewDetail={(id) => navigate(`/user/orders/${id}`)} 
                    onCancel={(code) => { setCancelOrderCode(code); setIsCancelModalOpen(true); }}
                    onGoToReviewTab={() => handleTabChange('AWAITING_REVIEW')}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 py-24 flex flex-col justify-center items-center">
                <Empty description={<span className="text-gray-500 font-semibold text-[15px]">Không tìm thấy đơn hàng nào!</span>} />
              </div>
            )
          )}
        </div>

        {/* PHÂN TRANG (Chỉ hiện cho Đơn hàng) */}
        {activeTab !== 'AWAITING_REVIEW' && totalElements > 0 && (
          <div className="mt-6 flex justify-end">
            <Pagination current={page + 1} pageSize={size} total={totalElements} onChange={(newPage) => setPage(newPage - 1)} showSizeChanger={false} />
          </div>
        )}
      </div>

      <CancelOrderModal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} orderCode={cancelOrderCode} />

      <ReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        reviewItem={selectedReviewItem} 
      />

    </div>
  );
}