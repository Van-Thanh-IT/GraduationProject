// File: src/modules/client/products/detail/ReviewListPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Rate, Spin, Empty, Image, Breadcrumb, Progress } from 'antd';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { HomeOutlined, StarFilled } from '@ant-design/icons';
import dayjs from 'dayjs';

// Import Hooks
import { useGetProductReviews, useGetProductReviewSummary } from '@/hooks/useReviews'; 

export default function ReviewListPage() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation();
  const productName = location.state?.productName || "Sản phẩm"; 

  // State bộ lọc sao (null = Tất cả)
  const [filterRating, setFilterRating] = useState(null);

  // Gọi API
  const { data: reviews, isLoading, isFetching } = useGetProductReviews(id, filterRating);
  const { data: reviewSummary, isLoading: isSummaryLoading } = useGetProductReviewSummary(id);
  
  const FILTER_TABS = [
    { key: null, label: 'Tất cả' },
    { key: 5, label: '5 Sao' },
    { key: 4, label: '4 Sao' },
    { key: 3, label: '3 Sao' },
    { key: 2, label: '2 Sao' },
    { key: 1, label: '1 Sao' },
  ];

  return (
    <div className="bg-[#f5f5fa] min-h-screen pb-16 pt-6 font-sans">
      {/* Mở rộng max-w lên 1100px để chứa layout 2 cột */}
      <div className="max-w-[1100px] mx-auto px-4 md:px-0">
        
        {/* Breadcrumb & Nút quay lại */}
        <div className="mb-6 flex flex-col gap-4">
          <Breadcrumb
            items={[
              { title: <span className="cursor-pointer hover:text-indigo-600" onClick={()=>navigate('/')}><HomeOutlined /> Trang chủ</span> },
              { title: <span className="cursor-pointer hover:text-indigo-600" onClick={()=>navigate(-1)}>Chi tiết sản phẩm</span> },
              { title: <span className="font-semibold text-slate-700">Đánh giá khách hàng</span> }
            ]}
          />
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors w-fit"
          >
            <ArrowLeft size={18} /> Quay lại sản phẩm
          </button>
          
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-tight mb-1">
              Đánh giá & Nhận xét
            </h1>
            <p className="text-[15px] font-medium text-slate-500 m-0 line-clamp-1">
              {productName}
            </p>
          </div>
        </div>

        {/* ================= LAYOUT 2 CỘT ================= */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          
          {/* CỘT TRÁI: TỔNG QUAN & BỘ LỌC (STICKY) */}
         <div className="w-full md:w-[320px] lg:w-[340px] shrink-0 sticky top-24 h-max z-10">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              
              {isSummaryLoading ? (
                <div className="py-10 flex justify-center"><Spin /></div>
              ) : (
                <>
                  <div className="flex flex-col items-center justify-center border-b border-slate-100 pb-6 mb-6">
                    <div className="text-5xl font-black text-amber-500 mb-1">
                      {reviewSummary?.averageRating ? Number(reviewSummary.averageRating).toFixed(1) : "0.0"}
                      <span className="text-2xl text-amber-500/50">/5</span>
                    </div>
                    <Rate disabled allowHalf value={reviewSummary?.averageRating || 0} className="text-amber-500 text-[18px]" />
                    <span className="text-slate-500 font-medium mt-2 text-[13px]">{reviewSummary?.totalReviews || 0} lượt đánh giá</span>
                  </div>

                  {/* Thanh tiến độ chi tiết từng sao */}
                  <div className="flex flex-col gap-2.5 mb-8">
                    {[
                      { star: 5, count: reviewSummary?.fiveStar || 0 },
                      { star: 4, count: reviewSummary?.fourStar || 0 },
                      { star: 3, count: reviewSummary?.threeStar || 0 },
                      { star: 2, count: reviewSummary?.twoStar || 0 },
                      { star: 1, count: reviewSummary?.oneStar || 0 },
                    ].map((item) => (
                      <div key={item.star} className="flex items-center gap-3 text-[13px]">
                        <div className="flex items-center gap-1 w-10 font-bold text-slate-600 shrink-0">
                          {item.star} <StarFilled className="text-amber-400 text-[11px]" />
                        </div>
                        <Progress 
                          percent={reviewSummary?.totalReviews ? (item.count / reviewSummary.totalReviews) * 100 : 0} 
                          showInfo={false} 
                          strokeColor="#f59e0b" 
                          trailColor="#f8fafc" 
                          className="m-0 flex-1"
                          size="small"
                        />
                        <span className="w-6 text-right text-slate-400 font-medium shrink-0">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Bộ lọc (Tabs) */}
              <div>
                <h3 className="text-[13px] font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Lọc theo đánh giá
                </h3>
                <div className="flex flex-wrap gap-2">
                  {FILTER_TABS.map(tab => (
                    <button
                      key={tab.key === null ? 'all' : tab.key}
                      onClick={() => setFilterRating(tab.key)}
                      className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all border ${
                        filterRating === tab.key 
                          ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-sm' 
                          : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100 hover:border-slate-200'
                      }`}
                    >
                      {tab.label} {tab.key === null && reviewSummary?.totalReviews !== undefined ? `(${reviewSummary.totalReviews})` : ''}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* CỘT PHẢI: DANH SÁCH BÌNH LUẬN */}
          <div className="flex-1 min-w-0 w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative min-h-[400px]">
            
            {(isLoading || isFetching) && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-2xl transition-all">
                <Spin size="large" />
              </div>
            )}

            {!isLoading && reviews?.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center">
                 <Empty 
                   description={<span className="text-slate-500 font-medium text-[15px]">Chưa có đánh giá nào cho mức sao này.</span>} 
                   image={Empty.PRESENTED_IMAGE_SIMPLE}
                 />
              </div>
            ) : (
              <div className="flex flex-col">
                {reviews?.map((review, index) => (
                  <div key={review.id} className={`py-6 flex gap-4 ${index !== reviews.length - 1 ? 'border-b border-slate-100' : ''}`}>
                    
                    {/* Avatar */}
                    <div className="shrink-0 pt-1">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-lg shadow-sm">
                        {review.userAvatar ? (
                          <img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" />
                        ) : (
                          review.userName?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                    </div>

                    {/* Nội dung */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                        <div>
                          <h4 className="font-bold text-[15px] text-slate-800 leading-tight">
                            {review.userName}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Rate disabled defaultValue={review.rating} className="text-[13px] text-amber-500 m-0" />
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                              <CheckCircle2 size={12} /> Đã mua hàng
                            </span>
                          </div>
                        </div>
                        <span className="text-[12px] font-medium text-slate-400">
                          {dayjs(review.createdAt).format('HH:mm DD/MM/YYYY')}
                        </span>
                      </div>

                      <div className="text-[12px] text-slate-400 font-medium mb-3">
                        Phân loại: {review.variantSpecs || 'Mặc định'}
                      </div>

                      <p className="text-[14.5px] text-slate-700 leading-relaxed whitespace-pre-wrap m-0 mb-4 break-words">
                        {review.comment}
                      </p>

                      {/* Hình ảnh */}
                      {review.images && review.images.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          <Image.PreviewGroup>
                            {review.images.map((imgUrl, imgIdx) => (
                              <Image 
                                key={imgIdx} 
                                width={80} 
                                height={80} 
                                src={imgUrl} 
                                className="rounded-lg object-cover border border-slate-200 cursor-pointer hover:border-indigo-400 hover:shadow-sm transition-all"
                              />
                            ))}
                          </Image.PreviewGroup>
                        </div>
                      )}

                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}