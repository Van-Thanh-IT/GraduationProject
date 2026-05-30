import React from 'react';
import { Empty } from 'antd';
import { Star, ArrowRight, ShoppingBag } from 'lucide-react';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

export default function RecentReviews({ reviews }) {
   
  const navigate = useNavigate();

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star 
        key={index} 
        size={14} 
        className={index < rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"} 
      />
    ));
  };

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow h-full">
      {/* HEADER TƯƠNG TỰ ĐƠN HÀNG */}
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-[24px]">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Đánh Giá Gần Đây</h3>
          <p className="text-[13px] font-medium text-slate-400 mt-1">Phản hồi từ khách hàng</p>
        </div>
        <button onClick={() => navigate("/admin/reviews")} className="flex items-center gap-1.5 text-[13px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors px-4 py-2.5 rounded-xl">
          Xem tất cả <ArrowRight size={16} strokeWidth={2.5} />
        </button>
      </div>
      
      {/* KHU VỰC SCROLL */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar max-h-[530px]">
        {reviews && reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((review, index) => (
              <div 
                key={index} 
                className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-sm transition-all group"
              >
                {/* Dòng 1: Số sao và Thời gian */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 capitalize bg-slate-50 px-2.5 py-1 rounded-md">
                    {moment(review.createdAt).fromNow()}
                  </span>
                </div>

                {/* Dòng 2: Nội dung bình luận */}
                <p className="text-[14px] text-slate-700 font-medium leading-relaxed mb-4">
                  {review.comment && review.comment.toLowerCase() !== "null" ? (
                    `"${review.comment}"`
                  ) : (
                    <span className="text-slate-400 italic font-normal">
                      Khách hàng chỉ chấm điểm, không để lại bình luận.
                    </span>
                  )}
                </p>

                {/* Dòng 3: Tên sản phẩm được highlight mờ */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2 group-hover:bg-blue-50/50 transition-colors">
                  <ShoppingBag size={14} className="text-slate-400 shrink-0 group-hover:text-blue-500 transition-colors" />
                  <span className="text-[12.5px] font-bold text-slate-600 line-clamp-1 group-hover:text-blue-700 transition-colors">
                    {review.productName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center min-h-[300px]">
             <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                description={<span className="text-slate-400 font-medium text-[14px]">Chưa có đánh giá nào mới</span>} 
             />
          </div>
        )}
      </div>
    </div>
  );
}