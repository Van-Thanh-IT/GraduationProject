import React from 'react';
import { Spin, Rate, Progress } from 'antd';
import { StarFilled, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export default function ProductReviewSummary({ productId, productName, reviewSummary, isLoading }) {
  const navigate = useNavigate();

  // Hàm xử lý chuyển hướng sang trang danh sách đánh giá
  const handleGoToReviews = () => {
    if (!productId) return;
    navigate(`/product/${productId}/reviews`, { state: { productName } });
  };

  return (
    <div 
      className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6 md:p-8 cursor-pointer hover:shadow-md transition-shadow group" 
      onClick={handleGoToReviews}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 uppercase tracking-wide m-0">
          <StarFilled className="text-amber-500" /> Đánh giá sản phẩm
        </h2>
        <button className="text-indigo-600 font-bold text-[14px] flex items-center gap-1 group-hover:text-indigo-700">
          Xem tất cả {reviewSummary?.totalReviews || 0} đánh giá <RightOutlined className="text-[12px] pt-0.5" />
        </button>
      </div>

      {isLoading ? (
        <div className="py-8 flex justify-center"><Spin /></div>
      ) : (
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 bg-amber-50/50 p-6 rounded-2xl border border-amber-100/50">
          {/* Điểm số tổng quát */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="text-5xl font-black text-amber-500 mb-1">
              {reviewSummary?.averageRating ? Number(reviewSummary.averageRating).toFixed(1) : "0.0"}
              <span className="text-2xl text-amber-500/50">/5</span>
            </div>
            <Rate disabled allowHalf value={reviewSummary?.averageRating || 0} className="text-amber-500 text-[18px]" />
            <span className="text-slate-500 font-medium mt-2 text-[13px]">{reviewSummary?.totalReviews || 0} lượt đánh giá</span>
          </div>

          {/* Thanh tiến độ chi tiết từng sao */}
          <div className="flex-1 w-full max-w-sm flex flex-col gap-2">
            {[
              { star: 5, count: reviewSummary?.fiveStar || 0 },
              { star: 4, count: reviewSummary?.fourStar || 0 },
              { star: 3, count: reviewSummary?.threeStar || 0 },
              { star: 2, count: reviewSummary?.twoStar || 0 },
              { star: 1, count: reviewSummary?.oneStar || 0 },
            ].map((item) => (
              <div key={item.star} className="flex items-center gap-3 text-[13px]">
                <div className="flex items-center gap-1 w-12 font-bold text-slate-600 shrink-0">
                  {item.star} <StarFilled className="text-amber-400 text-[11px]" />
                </div>
                <Progress 
                  percent={reviewSummary?.totalReviews ? (item.count / reviewSummary.totalReviews) * 100 : 0} 
                  showInfo={false} 
                  strokeColor="#f59e0b" // Màu amber-500
                  trailColor="#f1f5f9" // Màu slate-100
                  className="m-0"
                  size="small"
                />
                <span className="w-8 text-right text-slate-500 font-medium shrink-0">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}