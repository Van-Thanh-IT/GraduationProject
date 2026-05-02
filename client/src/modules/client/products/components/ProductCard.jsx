// File: src/modules/client/products/components/ProductCard.jsx
import React from 'react';
import { Star, Zap, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';

import { formatCurrency } from '@/utils/format'; 
import { useCountdown } from '@/hooks/useCountdown'; 

// Hàm phụ trợ: Format số lượng bán (VD: 1500 -> 1.5k, 10000 -> 10k)
const formatCompactNumber = (number) => {
  if (!number) return '0';
  if (number >= 1000) {
    return (number / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return number.toString();
};

const MiniCountdown = ({ endTime, isOutOfStock }) => {
  const { hours, minutes, seconds, isExpired } = useCountdown(endTime);

  const colorClass = (isOutOfStock || isExpired) ? 'text-slate-400 bg-slate-100' : 'text-orange-600 bg-orange-100';
  const textClass = (isOutOfStock || isExpired) ? 'text-slate-400' : 'text-orange-500';

  return (
    <div className="flex items-center justify-between mt-1 mb-1.5">
      <div className={`flex items-center gap-1 ${textClass}`}>
        <Timer size={12} strokeWidth={2.5} />
        <span className="text-[10px] font-bold">
           {isExpired ? 'Đã kết thúc' : 'Kết thúc trong'}
        </span>
      </div>
      <div className="flex items-center gap-0.5">
        <span className={`${colorClass} px-1 rounded font-mono text-[10px] font-bold`}>{hours}</span>
        <span className={`${textClass} font-bold text-[10px]`}>:</span>
        <span className={`${colorClass} px-1 rounded font-mono text-[10px] font-bold`}>{minutes}</span>
        <span className={`${textClass} font-bold text-[10px]`}>:</span>
        <span className={`${colorClass} px-1 rounded font-mono text-[10px] font-bold`}>{seconds}</span>
      </div>
    </div>
  );
};

export default function ProductCard({ product }) {
  // 1. Đã bổ sung biến soldCount vào đây
  const { flashSale, originalPrice, price, stockQuantity, thumbnail, name, slug, id, isNew, rating, reviewCount, specs, soldCount } = product;

  const isFlashSale = flashSale && flashSale.isActiveNow;
  const displayPrice = isFlashSale ? flashSale.flashSalePrice : price;
  const hasDiscount = originalPrice > displayPrice;
  const discountPercent = hasDiscount 
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) 
    : 0;

  const isOutOfStock = stockQuantity === 0 || (isFlashSale && flashSale.saleStockQuantity > 0 && flashSale.soldQuantity >= flashSale.saleStockQuantity);
  const productUrl = `/product/${slug || id}`;

  const progressPercent = isFlashSale 
    ? Math.min(((flashSale.soldQuantity / flashSale.saleStockQuantity) * 100) || 5, 100) 
    : 0;

  return (
    <Link 
      to={productUrl}
      className="group relative bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden w-full no-underline text-inherit hover:text-inherit transition-all duration-300 hover:shadow-lg hover:border-indigo-100"
    >
      {/* ================= KHU VỰC 1: HÌNH ẢNH ================= */}
      <div className="relative aspect-square overflow-hidden bg-slate-50/50 p-4">
        <img 
          src={thumbnail} 
          alt={name} 
          className={`w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? 'opacity-50' : ''}`} 
        />
        
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {hasDiscount && (
            <span className={`${isFlashSale ? 'bg-orange-500 shadow-orange-200' : 'bg-rose-500 shadow-rose-200'} text-white text-[11px] font-bold px-2 py-1 rounded-md shadow-sm leading-none`}>
              -{discountPercent}%
            </span>
          )}
          {isNew && !isFlashSale && (
            <span className="bg-blue-600 text-white text-[11px] font-bold px-2 py-1 rounded-md shadow-sm leading-none">MỚI</span>
          )}
        </div>

        {isFlashSale && !isOutOfStock && (
          <div className="absolute top-3 right-3 bg-gradient-to-br from-orange-400 to-red-500 text-white p-1.5 rounded-full shadow-md animate-pulse z-10">
            <Zap size={14} fill="currentColor" />
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] flex items-center justify-center z-20">
            <div className="bg-slate-800 text-white text-[11px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">
              Hết hàng
            </div>
          </div>
        )}
      </div>

      {/* ================= KHU VỰC 2: THÔNG TIN ================= */}
      <div className="p-4 flex flex-col flex-1 gap-2 bg-white">
        
        <div className="flex gap-1.5 flex-wrap min-h-[20px]">
          {specs?.slice(0, 2).map((spec, index) => (
            <span key={index} className="bg-slate-100 text-slate-500 text-[9.5px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">
              {spec}
            </span>
          ))}
        </div>

        <h3 className="text-[13.5px] font-semibold text-slate-800 line-clamp-2 leading-snug h-[38px]">
          {name}
        </h3>

        {/* 2. ĐÃ SỬA: KHỐI ĐÁNH GIÁ & LƯỢT BÁN (Luôn hiển thị) */}
        <div className="flex items-center gap-2 mt-0.5">
          <div className="flex items-center text-amber-400">
            <Star size={12} fill="currentColor" />
            <span className="text-[11px] font-bold text-slate-700 ml-1">{rating || 0}</span>
             <span className="text-[11px] text-slate-500 ml-1">({reviewCount || 'Chưa có'})</span>
          </div>
          
          {/* Thanh dọc chia cách mỏng manh tinh tế */}
          <div className="w-[1px] h-2.5 bg-slate-300"></div>
          
          <span className="text-[11px] text-slate-500 font-medium">
            Đã bán {formatCompactNumber(soldCount)}
          </span>
        </div>

        {/* KHỐI GIÁ & MUA HÀNG */}
        <div className="mt-auto pt-2 flex flex-col gap-1.5">
          
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className={`text-[17px] font-black leading-none ${isFlashSale ? 'text-orange-600' : 'text-rose-600'} ${isOutOfStock ? 'opacity-60' : ''}`}>
              {formatCurrency(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-slate-400 line-through leading-none font-medium">
                {formatCurrency(originalPrice)}
              </span>
            )}
          </div>

          {isFlashSale ? (
            <div className="flex flex-col">
              <MiniCountdown endTime={flashSale.endTime} isOutOfStock={isOutOfStock} />

              <div className="relative w-full h-[18px] bg-orange-100/50 rounded-full overflow-hidden mt-0.5">
                 <div 
                  className={`absolute top-0 left-0 h-full transition-all duration-700 ${isOutOfStock ? 'bg-slate-300' : 'bg-gradient-to-r from-orange-400 to-red-500'}`}
                  style={{ width: isOutOfStock ? '100%' : `${progressPercent}%` }}
                 ></div>
                 <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white uppercase tracking-wider drop-shadow-sm mix-blend-difference">
                    {isOutOfStock 
                      ? 'Đã bán hết' 
                      : (flashSale.soldQuantity > 0 ? `Vừa bán ${flashSale.soldQuantity}` : 'Đang bán chạy') // Sửa nhẹ text để không bị lặp chữ "Đã bán" với bên trên
                    }
                 </span>
              </div>
            </div>
          ) : (
            <div className={`px-3 py-2 mt-1 flex items-center justify-center rounded-lg text-xs font-bold transition-all duration-300 ${
              isOutOfStock 
                ? 'bg-slate-100 text-slate-400' 
                : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
            }`}>
               {isOutOfStock ? "HẾT HÀNG" : "MUA NGAY"}
            </div>
          )}

        </div>
      </div>
    </Link>
  );
}