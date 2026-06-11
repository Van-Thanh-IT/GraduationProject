import React from 'react';
import { Star, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/utils/format'; 
import { useCountdown } from '@/hooks/useCountdown'; 

const formatCompactNumber = (number) => {
  if (!number) return '0';
  if (number >= 1000) {
    return (number / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return number.toString();
};

const MiniCountdown = ({ endTime, isOutOfStock }) => {
  const { hours, minutes, seconds, isExpired } = useCountdown(endTime);

  if (isExpired || isOutOfStock) return null;

  return (
    <div className="flex items-center gap-1 mt-1 text-red-500">
      <Timer size={12} strokeWidth={2.5} />
      <span className="text-[11px] font-medium">Kết thúc trong:</span>
      <div className="flex items-center gap-0.5 ml-1">
        <span className="bg-red-50 text-red-600 px-1 rounded text-[11px] font-bold font-mono">{hours}</span>
        <span className="text-red-500 font-bold text-[10px]">:</span>
        <span className="bg-red-50 text-red-600 px-1 rounded text-[11px] font-bold font-mono">{minutes}</span>
        <span className="text-red-500 font-bold text-[10px]">:</span>
        <span className="bg-red-50 text-red-600 px-1 rounded text-[11px] font-bold font-mono">{seconds}</span>
      </div>
    </div>
  );
};

export default function ProductCard({ product }) {
  const { flashSale, originalPrice, price, stockQuantity, thumbnail, name, slug, id, rating, reviewCount, specs, soldCount } = product;

  const isFlashSale = flashSale && flashSale.isActiveNow;
  const displayPrice = isFlashSale ? flashSale.flashSalePrice : price;
  const hasDiscount = originalPrice > displayPrice;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;

  const isOutOfStock = stockQuantity === 0 || (isFlashSale && flashSale.saleStockQuantity > 0 && flashSale.soldQuantity >= flashSale.saleStockQuantity);
  const productUrl = `/product/${slug || id}`;

  const progressPercent = isFlashSale 
    ? Math.min(((flashSale.soldQuantity / flashSale.saleStockQuantity) * 100) || 5, 100) 
    : 0;

  return (
    <Link 
      to={productUrl}
      className="h-full group bg-white rounded-xl border border-gray-100 flex flex-col overflow-hidden w-full no-underline text-inherit hover:border-gray-300 transition-all duration-200"
    >
      <div className="relative w-full aspect-square bg-white shrink-0 overflow-hidden">
        
        <img 
          src={thumbnail} 
          alt={name} 
          className={`absolute inset-0 w-full h-full p-4 object-contain transition-transform duration-300 group-hover:scale-105 ${isOutOfStock ? 'opacity-40' : ''}`} 
        />
        
        {/* Nhãn giảm giá */}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10">
            -{discountPercent}%
          </span>
        )}

        {/* Cột thông số kĩ thuật */}
        {specs && specs.length > 0 && (
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-10">
            {specs.slice(0, 3).map((spec, index) => (
              <span key={index} className="bg-gray-50 border border-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded font-medium shadow-sm">
                {spec}
              </span>
            ))}
          </div>
        )}

        {/* Trạng thái hết hàng */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-20">
            <div className="bg-gray-800/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              Hết hàng
            </div>
          </div>
        )}
      </div>

      {/* ================= KHU VỰC 2: THÔNG TIN VÀ GIÁ BÁN ================= */}
      <div className="p-3.5 flex flex-col flex-1 border-t border-gray-50">
        
        {/* Tên sản phẩm */}
        <h3 className="text-[14px] font-medium text-gray-800 line-clamp-2 leading-snug h-[42px] m-0 mb-2 group-hover:text-blue-600 transition-colors">
          {name}
        </h3>

        {/* Khối mt-auto ép phần giá, đánh giá, thanh sale xuống sát đáy thẻ */}
        <div className="mt-auto flex flex-col gap-1.5">
          
          {/* Giá tiền */}
          <div className="flex items-baseline gap-1.5 flex-wrap min-h-[24px]">
            <span className={`text-[16px] font-bold ${isFlashSale ? 'text-orange-600' : 'text-red-600'}`}>
              {formatCurrency(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-[12px] text-gray-400 line-through font-normal">
                {formatCurrency(originalPrice)}
              </span>
            )}
          </div>

          {/* Đánh giá & Lượt bán */}
          <div className="flex items-center gap-2 text-[12px] text-gray-500">
            <div className="flex items-center text-amber-400 gap-0.5">
              <Star size={12} fill="currentColor" />
              <span className="font-bold text-gray-700">{rating || 0}</span>
              {reviewCount > 0 && <span className="text-gray-400">({reviewCount})</span>}
            </div>
            <span className="text-gray-300">|</span>
            <span>Đã bán {formatCompactNumber(soldCount)}</span>
          </div>

          {/* Thanh tiến trình Flash Sale (Chỉ hiện khi có Flash Sale) */}
          {isFlashSale && (
            <div className="mt-1 flex flex-col gap-1">
              <div className="relative w-full h-[15px] bg-red-100 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-red-500 transition-all duration-500"
                  style={{ width: isOutOfStock ? '100%' : `${progressPercent}%` }}
                ></div>
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white uppercase tracking-wider mix-blend-difference">
                  {isOutOfStock ? 'Đã bán hết' : `Đã bán ${flashSale.soldQuantity}`}
                </span>
              </div>
              <MiniCountdown endTime={flashSale.endTime} isOutOfStock={isOutOfStock} />
            </div>
          )}

        </div>
      </div>
    </Link>
  );
}