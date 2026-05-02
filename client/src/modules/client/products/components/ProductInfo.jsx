// File: src/modules/client/products/detail/components/ProductInfo.jsx
import React, { useMemo } from 'react';
import { Rate, Tag } from 'antd';
import { CheckCircleFilled, SafetyCertificateFilled } from '@ant-design/icons';
import { Zap, Timer } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAddToCart } from '@/hooks/useCart';

// 1. IMPORT HÀM DÙNG CHUNG TỪ EXTERNAL
import { formatCurrency } from '@/utils/format'; // Nhớ check lại đường dẫn file format của bạn
import { useCountdown } from '@/hooks/useCountdown'; 

// ==============================================================
// COMPONENT: ĐỒNG HỒ ĐẾM NGƯỢC FLASH SALE (TO) - ĐÃ DÙNG HOOK
// ==============================================================
const FlashSaleCountdown = ({ endTime }) => {
  // 2. GỌI HOOK SIÊU GỌN
  const { hours, minutes, seconds } = useCountdown(endTime);

  return (
    <div className="flex items-center gap-1.5 ml-auto">
      <span className="text-[12px] font-bold text-white/90 mr-1 flex items-center gap-1">
        <Timer size={14} /> KẾT THÚC TRONG
      </span>
      <span className="bg-black/40 backdrop-blur-sm text-white px-2 py-1 rounded-md font-mono text-[13px] font-bold">{hours}</span>
      <span className="text-white font-bold text-[12px]">:</span>
      <span className="bg-black/40 backdrop-blur-sm text-white px-2 py-1 rounded-md font-mono text-[13px] font-bold">{minutes}</span>
      <span className="text-white font-bold text-[12px]">:</span>
      <span className="bg-black/40 backdrop-blur-sm text-white px-2 py-1 rounded-md font-mono text-[13px] font-bold">{seconds}</span>
    </div>
  );
};


export default function ProductInfo({ product, currentVariant, selectedOptions, onOptionChange }) {
  
  const { mutate: addToCart, isLoading: isAdding } = useAddToCart();

  // Kiểm tra Biến thể hiện tại CÓ đang Flash Sale không?
  const isFlashSale = currentVariant?.flashSale && currentVariant.flashSale.isActiveNow;
  const fsData = currentVariant?.flashSale;

  // Lấy giá trị để hiển thị (Ưu tiên giá Flash Sale)
  const displayPrice = isFlashSale ? fsData.flashSalePrice : currentVariant?.price;
  const originalPrice = currentVariant?.originalPrice;
  const hasDiscount = originalPrice > displayPrice;
  
  // Tính % giảm giá thực tế
  const discountPercent = hasDiscount 
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;

  // Tính tiến độ bán hàng (Progress Bar)
  const progressPercent = isFlashSale 
    ? Math.min(((fsData.soldQuantity / fsData.saleStockQuantity) * 100) || 5, 100) : 0;


  // ==============================================================
  // 1. TẠO CẤU HÌNH OPTION (LỌC TRÙNG & SẮP XẾP DEFAULT LÊN ĐẦU)
  // ==============================================================
  const optionConfigs = useMemo(() => {
    const configs = [
      { name: product.option1Name, key: 'option1' },
      { name: product.option2Name, key: 'option2' },
      { name: product.option3Name, key: 'option3' },
    ].filter(opt => opt.name);

    const defaultVariant = product.variants?.find(v => v.isDefault) || product.variants?.[0];

    return configs.map(opt => {
      const valueKey = opt.key + 'Value'; 
      const defaultValue = defaultVariant?.[valueKey];

      const rawValues = product.variants?.map(v => v[valueKey]).filter(Boolean) || [];

      const uniqueValues = [];
      const seen = new Set();
      
      rawValues.forEach(val => {
        const normalizedVal = val.trim().toLowerCase();
        if (!seen.has(normalizedVal)) {
          seen.add(normalizedVal);
          uniqueValues.push(val.trim()); 
        }
      });

      if (defaultValue) {
        const normalizedDefault = defaultValue.trim().toLowerCase();
        uniqueValues.sort((a, b) => {
          if (a.toLowerCase() === normalizedDefault) return -1;
          if (b.toLowerCase() === normalizedDefault) return 1;
          return 0; 
        });
      }

      return { ...opt, values: uniqueValues };
    });
  }, [product]);

  // ==============================================================
  // 2. THUẬT TOÁN KIỂM TRA ĐIỀU KIỆN (THÁC NƯỚC STRICT)
  // ==============================================================
  const isOptionValid = (optionLevel, value) => {
    const normalize = (str) => str ? String(str).trim().toLowerCase() : '';
    const nValue = normalize(value);
    const nOpt1 = normalize(selectedOptions.option1);
    const nOpt2 = normalize(selectedOptions.option2);

    return product.variants.some(v => {
      const vOpt1 = normalize(v.option1Value);
      const vOpt2 = normalize(v.option2Value);
      const vOpt3 = normalize(v.option3Value);

      if (optionLevel === 'option1') return vOpt1 === nValue;
      if (optionLevel === 'option2') return nOpt1 && vOpt1 === nOpt1 && vOpt2 === nValue;
      if (optionLevel === 'option3') return nOpt1 && nOpt2 && vOpt1 === nOpt1 && vOpt2 === nOpt2 && vOpt3 === nValue;
      return false;
    });
  };

  // ==============================================================
  // 3. HÀM TRÍCH XUẤT ẢNH & GIÁ CHO NÚT BẤM
  // ==============================================================
  const getVariantImage = (colorValue) => {
    const variant = product.variants.find(v => v.option1Value?.toLowerCase() === colorValue.toLowerCase());
    const thumb = variant?.images?.find(img => img.isThumbnail) || variant?.images?.[0];
    return thumb?.imageUrl;
  };

  const getCapacityPrice = (capacityValue) => {
    let variant = product.variants.find(v => 
      v.option1Value?.toLowerCase() === selectedOptions.option1?.toLowerCase() && 
      v.option2Value?.toLowerCase() === capacityValue.toLowerCase()
    );
    if (!variant) {
      variant = product.variants.find(v => v.option2Value?.toLowerCase() === capacityValue.toLowerCase());
    }
    
    // Nếu Biến thể đó đang Flash Sale, hiển thị giá Flash Sale trên nút
    const isVariantFS = variant?.flashSale && variant.flashSale.isActiveNow;
    return isVariantFS ? variant.flashSale.flashSalePrice : variant?.price;
  };

  const handleAddToCart = () => {
    if (!currentVariant || currentVariant.stockQuantity === 0) return;
    addToCart({
      productVariantId: currentVariant.id,
      quantity: 1 
    });
  };

  return (
    <div className="flex flex-col gap-6 md:gap-7">
      {/* Tiêu đề & Đánh giá */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Tag color="blue" className="rounded-full border-none font-bold text-[13px] px-3 py-0.5">Chính hãng {product.brandName}</Tag>
          <span className="flex items-center text-sm text-slate-500 gap-1 font-medium">
            <Rate disabled defaultValue={product.averageRating} className="text-sm text-amber-400" />
            ({product.totalReviews} đánh giá)
          </span>
        </div>
        <h1 className="text-2xl md:text-[28px] font-black text-slate-800 leading-snug mb-5">{product.name}</h1>
        
        {/* ================= KHỐI GIÁ TIỀN & BANNER FLASH SALE ================= */}
        <div className="rounded-2xl flex flex-col overflow-hidden border border-slate-100 shadow-sm relative">
          
          {/* BANNER FLASH SALE (Chỉ hiện nếu Biến thể đang được Sale) */}
          {isFlashSale && (
            <div className="w-full bg-gradient-to-r from-orange-500 to-red-600 px-5 py-3 flex items-center">
              <div className="flex items-center gap-2 text-white">
                <Zap size={22} fill="currentColor" className="text-yellow-300 animate-pulse" />
                <span className="text-[18px] font-black italic tracking-wide uppercase drop-shadow-sm">Flash Sale</span>
              </div>
              {/* ĐỒNG HỒ */}
              <FlashSaleCountdown endTime={fsData.endTime} />
            </div>
          )}

          {/* KHU VỰC HIỂN THỊ GIÁ */}
          <div className={`p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 ${isFlashSale ? 'bg-orange-50/40' : 'bg-gradient-to-r from-indigo-50 to-blue-50'}`}>
            
            {/* Giá bên trái */}
            <div className="flex items-center gap-3 md:gap-4 flex-wrap">
              <span className={`text-3xl md:text-[34px] font-black tracking-tight ${isFlashSale ? 'text-orange-600' : 'text-rose-600'}`}>
                {formatCurrency(displayPrice)}
              </span>
              
              {hasDiscount && (
                <div className="flex items-center gap-3">
                  <span className="text-base md:text-lg text-slate-400 line-through font-semibold">
                    {formatCurrency(originalPrice)}
                  </span>
                  <span className={`px-2.5 py-1 text-white text-[13px] font-black rounded-lg shadow-sm ${isFlashSale ? 'bg-orange-500' : 'bg-rose-500'}`}>
                    GIẢM {discountPercent}%
                  </span>
                </div>
              )}
            </div>

            {/* Thanh Tiến độ (Nếu có Flash Sale) */}
            {isFlashSale && (
              <div className="w-full md:w-[160px] flex flex-col items-end gap-1.5">
                <div className="relative w-full h-[18px] bg-orange-200/50 rounded-full overflow-hidden border border-orange-200">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white uppercase tracking-wider drop-shadow-sm mix-blend-difference">
                    Đã bán {fsData.soldQuantity}
                  </span>
                </div>
              </div>
            )}
            
          </div>
        </div>

      </div>

      {/* ================= RENDER CÁC NÚT BẤM ================= */}
      <div className="space-y-6">
        {optionConfigs.map((opt) => (
          <div key={opt.key}>
            <h3 className="text-[15px] font-bold text-slate-800 mb-3">{opt.name}:</h3>
            <div className="flex flex-wrap gap-3">
              
              {opt.values.map(val => {
                const isSelected = selectedOptions[opt.key] && selectedOptions[opt.key].trim().toLowerCase() === val.toLowerCase();
                const isValid = isOptionValid(opt.key, val); 

                if (!isValid && opt.key !== 'option1') return null;
                if (!isValid && opt.key === 'option1') return null;

                // NÚT MÀU SẮC
                if (opt.key === 'option1') {
                  const imageUrl = getVariantImage(val);
                  return (
                    <button
                      key={val}
                      onClick={() => onOptionChange(opt.key, val)} 
                      className={`relative flex items-center gap-2 pr-4 pl-1.5 py-1.5 rounded-xl border transition-all duration-200 ${
                        isSelected ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600/20 ring-offset-1 z-10' : 'border-slate-200 hover:border-indigo-400 bg-white'
                      }`}
                    >
                      {imageUrl && <img src={imageUrl} alt={val} className="w-8 h-8 rounded-lg object-contain bg-white border border-slate-100" />}
                      <span className={`text-[13.5px] font-bold ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>{val}</span>
                      {isSelected && <CheckCircleFilled className="absolute -top-1.5 -right-1.5 text-[16px] text-indigo-600 bg-white rounded-full shadow-sm" />}
                    </button>
                  );
                }

                // NÚT DUNG LƯỢNG
                if (opt.key === 'option2') {
                  const price = getCapacityPrice(val);
                  return (
                    <button
                      key={val}
                      onClick={() => onOptionChange(opt.key, val)} 
                      className={`relative flex flex-col items-center justify-center min-w-[100px] px-4 py-2 rounded-xl border transition-all duration-200 ${
                        isSelected ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600/20 ring-offset-1 z-10' : 'border-slate-200 hover:border-indigo-400 bg-white'
                      }`}
                    >
                      <span className={`text-[14px] font-black ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>{val}</span>
                      {price && (
                        <span className={`text-[11px] font-semibold mt-0.5 ${isSelected ? 'text-indigo-500' : 'text-slate-500'}`}>
                          {formatCurrency(price)}
                        </span>
                      )}
                      {isSelected && <CheckCircleFilled className="absolute -top-1.5 -right-1.5 text-[16px] text-indigo-600 bg-white rounded-full shadow-sm" />}
                    </button>
                  );
                }

                // NÚT THƯỜNG
                return (
                  <button
                    key={val}
                    onClick={() => onOptionChange(opt.key, val)} 
                    className={`relative px-5 py-2.5 rounded-xl border text-[14px] font-bold transition-all duration-200 ${
                      isSelected ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-600/20 ring-offset-1 z-10' : 'border-slate-200 hover:border-indigo-400 bg-white'
                    }`}
                  >
                    {val}
                    {isSelected && <CheckCircleFilled className="absolute -top-1.5 -right-1.5 text-[16px] text-indigo-600 bg-white rounded-full shadow-sm" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* NÚT THÊM VÀO GIỎ & THANH TOÁN */}
      <div className="pt-6 border-t border-slate-100 space-y-5">
        <div className="flex flex-wrap items-center gap-6 text-[14px] text-slate-600 font-medium">
           <span className="flex items-center gap-1.5"><SafetyCertificateFilled className="text-emerald-500 text-lg" /> Bảo hành {product.warrantyPeriod}</span>
           <span>Tình trạng kho: <strong className={currentVariant?.stockQuantity > 0 ? "text-emerald-600" : "text-rose-500"}>{currentVariant?.stockQuantity > 0 ? `Còn ${currentVariant.stockQuantity} sản phẩm` : "Tạm hết hàng"}</strong></span>
        </div>

        <div className="flex gap-4">
           <Button 
             disabled={currentVariant?.stockQuantity === 0}
             onClick={handleAddToCart}          
              loading={isAdding}
             className="flex-1 h-14 bg-white border-2 border-indigo-600 text-indigo-700 text-[15px] font-black rounded-xl hover:bg-indigo-50 transition-colors disabled:border-slate-300 disabled:text-slate-400"
           >
              THÊM VÀO GIỎ
           </Button>
           <Button 
             disabled={currentVariant?.stockQuantity === 0}
             className="flex-1 h-14 bg-indigo-600 text-white text-[15px] font-black rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:bg-slate-300 disabled:shadow-none"
           >
              MUA NGAY
           </Button>
        </div>
      </div>
    </div>
  );
}