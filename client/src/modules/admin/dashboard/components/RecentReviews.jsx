import React from 'react';
import { Empty } from 'antd';
import { Star } from 'lucide-react';
import moment from 'moment';

export default function RecentReviews({ reviews }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
      <div className="flex items-center justify-between mb-6">
         <div>
            <h3 className="text-lg font-black text-slate-800">Đánh Giá Gần Đây</h3>
            <p className="text-xs font-medium text-slate-400 mt-0.5">Phản hồi từ khách hàng</p>
         </div>
      </div>
      
      <div className="flex-1 space-y-4">
        {reviews && reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div key={index} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-sm text-slate-800 line-clamp-1 flex-1 pr-2">{review.productName}</span>
                <span className="flex items-center gap-1 text-amber-500 text-xs font-black shrink-0 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                  {review.rating} <Star size={12} fill="currentColor" />
                </span>
              </div>
              <p className="text-sm text-slate-600 line-clamp-2 italic leading-relaxed">"{review.comment}"</p>
              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">{moment(review.createdAt).fromNow()}</p>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
             <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className="text-slate-400 font-medium">Chưa có đánh giá mới</span>} />
          </div>
        )}
      </div>
    </div>
  );
}