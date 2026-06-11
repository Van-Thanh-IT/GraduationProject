// File: src/modules/client/products/detail/components/ProductInfo.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { Rate } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Timer, ShieldCheck, ShoppingCart, Minus, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAddToCart } from '@/hooks/useCart';
import { formatCurrency } from '@/utils/format'; 
import { useCountdown } from '@/hooks/useCountdown'; 

const FlashSaleCountdown = ({ endTime }) => {
  const { hours, minutes, seconds } = useCountdown(endTime);

  return (
    <div className="flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
      <span className="text-[12px] font-bold text-red-600 flex items-center gap-1 mr-1">
        <Timer size={13} /> KẾT THÚC TRONG
      </span>
      <span className="bg-red-600 text-white px-1.5 py-0.5 rounded font-mono text-[12px] font-bold">{hours}</span>
      <span className="text-red-600 font-bold text-[12px]">:</span>
      <span className="bg-red-600 text-white px-1.5 py-0.5 rounded font-mono text-[12px] font-bold">{minutes}</span>
      <span className="text-red-600 font-bold text-[12px]">:</span>
      <span className="bg-red-600 text-white px-1.5 py-0.5 rounded font-mono text-[12px] font-bold">{seconds}</span>
    </div>
  );
};

export default function ProductInfo({ product, currentVariant, selectedOptions, onOptionChange }) {
  const { mutate: addToCart, isLoading: isAdding } = useAddToCart();
  const navigate = useNavigate();
  
  // State quản lý số lượng mua
  const [quantity, setQuantity] = useState(1);

  // Tự động reset số lượng về 1 khi đổi biến thể (đổi màu, dung lượng...)
  useEffect(() => {
    setQuantity(1);
  }, [currentVariant?.id]);

  const isFlashSale = currentVariant?.flashSale && currentVariant.flashSale.isActiveNow;
  const fsData = currentVariant?.flashSale;

  const displayPrice = isFlashSale ? fsData.flashSalePrice : currentVariant?.price;
  const originalPrice = currentVariant?.originalPrice;
  const hasDiscount = originalPrice > displayPrice;
  
  const discountPercent = hasDiscount ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;
  const progressPercent = isFlashSale ? Math.min(((fsData.soldQuantity / fsData.saleStockQuantity) * 100) || 5, 100) : 0;

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
    const isVariantFS = variant?.flashSale && variant.flashSale.isActiveNow;
    return isVariantFS ? variant.flashSale.flashSalePrice : variant?.price;
  };

  const handleAddToCart = () => {
    if (!currentVariant || currentVariant.stockQuantity === 0) return;
    addToCart({ productVariantId: currentVariant.id, quantity });
  };

  const handleBuyNow = () => {
    if (!currentVariant || currentVariant.stockQuantity === 0) return;
    navigate('/checkout', {
      state: {
        buyNowItem: {
          variantId: currentVariant.id,
          quantity,
          productName: product.name,
          imageUrl: currentVariant.images?.[0]?.imageUrl,
          options: `${currentVariant.option1Value || ''} ${currentVariant.option2Value || ''}`.trim(),
          price: displayPrice,
          flashSale: currentVariant.flashSale || null
        }
      }
    });
  };

  return (
    <div className="flex flex-col gap-4 font-sans bg-white p-1">
      {/* Tên & Đánh giá */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 leading-snug m-0 mb-1.5">{product.name}</h1>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="font-semibold text-blue-600">Thương hiệu: {product.brandName}</span>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-1">
            <Rate disabled defaultValue={product.averageRating} className="text-[12px] text-amber-400" />
            <span className="text-xs text-gray-600 mt-0.5">({product.totalReviews} đánh giá)</span>
          </div>
        </div>
      </div>

      {/* KHỐI HIỂN THỊ GIÁ PHẲNG THEO HOÀNG HÀ MOBILE */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-3">
        <div className="flex items-baseline flex-wrap gap-2.5">
          <span className="text-2xl md:text-3xl font-bold text-red-600 tracking-tight">
            {formatCurrency(displayPrice)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-sm text-gray-400 line-through font-normal">
                {formatCurrency(originalPrice)}
              </span>
              <span className="text-[12px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded">
                GIẢM {discountPercent}%
              </span>
            </>
          )}
        </div>

        {isFlashSale && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-gray-200/60 pt-2.5">
            <div className="w-full sm:w-[160px]">
              <div className="relative w-full h-[14px] bg-red-100 rounded-full overflow-hidden">
                <div className="absolute h-full bg-red-500 transition-all" style={{ width: `${progressPercent}%` }}></div>
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white uppercase mix-blend-difference">
                  Đã bán {fsData.soldQuantity}
                </span>
              </div>
            </div>
            <FlashSaleCountdown endTime={fsData.endTime} />
          </div>
        )}
      </div>

      {/* CHỌN CÁC BIẾN THỂ (MÀU SẮC, DUNG LƯỢNG) */}
      <div className="space-y-4">
        {optionConfigs.map((opt) => (
          <div key={opt.key}>
            <span className="text-[13px] font-bold text-gray-500 block mb-1.5">{opt.name}</span>
            <div className="flex flex-wrap gap-2">
              {opt.values.map(val => {
                const isSelected = selectedOptions[opt.key] && selectedOptions[opt.key].trim().toLowerCase() === val.toLowerCase();
                const isValid = isOptionValid(opt.key, val); 

                if (!isValid) return null;

                // NÚT MÀU SẮC (CÓ ẢNH THU NHỎ)
                if (opt.key === 'option1') {
                  const imageUrl = getVariantImage(val);
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => onOptionChange(opt.key, val)} 
                      className={`relative flex items-center gap-2 pr-3 pl-1 py-1 rounded-lg border text-left transition-all ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/30 font-semibold' 
                          : 'border-gray-200 hover:border-gray-400 bg-white'
                      }`}
                    >
                      {imageUrl && <img src={imageUrl} alt={val} className="w-7 h-7 rounded object-contain bg-white border border-gray-100" />}
                      <span className="text-[13px] text-gray-700">{val}</span>
                      {isSelected && <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px]"><CheckOutlined /></div>}
                    </button>
                  );
                }

                // NÚT DUNG LƯỢNG / PHIÊN BẢN (CÓ GIÁ TIỀN NHỎ Ở DƯỚI)
                if (opt.key === 'option2') {
                  const price = getCapacityPrice(val);
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => onOptionChange(opt.key, val)} 
                      className={`relative flex flex-col items-center justify-center min-w-[110px] px-3 py-1.5 rounded-lg border text-center transition-all ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/30' 
                          : 'border-gray-200 hover:border-gray-400 bg-white'
                      }`}
                    >
                      <span className={`text-[13px] ${isSelected ? 'font-bold text-gray-800' : 'text-gray-700'}`}>{val}</span>
                      {price && (
                        <span className="text-[10px] text-red-500 font-medium mt-0.5">
                          {formatCurrency(price)}
                        </span>
                      )}
                      {isSelected && <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px]"><CheckOutlined /></div>}
                    </button>
                  );
                }

                // NÚT THƯỜNG KHÁC
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => onOptionChange(opt.key, val)} 
                    className={`relative px-4 py-1.5 rounded-lg border text-[13px] text-gray-700 transition-all ${
                      isSelected ? 'border-blue-600 bg-blue-50/30 font-bold' : 'border-gray-200 hover:border-gray-400 bg-white'
                    }`}
                  >
                    {val}
                    {isSelected && <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px]"><CheckOutlined /></div>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* KHỐI KHO VÀ CHỌN SỐ LƯỢNG */}
      <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        
        {/* Chọn số lượng */}
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-bold text-gray-500">Số lượng:</span>
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg h-9 overflow-hidden">
            <button
              onClick={() => setQuantity(prev => prev - 1)}
              disabled={quantity <= 1 || currentVariant?.stockQuantity === 0}
              className="w-9 h-full flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Minus size={14} strokeWidth={2.5} />
            </button>
            <div className="w-12 h-full flex items-center justify-center bg-white border-x border-gray-200 text-[13px] font-bold text-gray-800 select-none">
              {quantity}
            </div>
            <button
              onClick={() => setQuantity(prev => prev + 1)}
              disabled={quantity >= (currentVariant?.stockQuantity || 0) || currentVariant?.stockQuantity === 0}
              className="w-9 h-full flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Trạng thái kho & Bảo hành */}
        <div className="flex flex-wrap items-center gap-3 text-[13px] text-gray-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="text-green-600 w-4 h-4" /> Bảo hành {product.warrantyPeriod}
          </span>
          <span className="text-gray-300">|</span>
          <span>
            Tình trạng: <strong className={currentVariant?.stockQuantity > 0 ? "text-green-600" : "text-red-500"}>
              {currentVariant?.stockQuantity > 0 ? `Còn ${currentVariant.stockQuantity} sản phẩm` : "Hết hàng"}
            </strong>
          </span>
        </div>
      </div>

      {/* HÀNG NÚT THAO TÁC CỐ ĐỊNH CHUẨN KÍCH THƯỚC */}
      <div className="flex gap-3 pt-2">
        <Button 
          disabled={currentVariant?.stockQuantity === 0}
          onClick={handleAddToCart}          
          loading={isAdding}
          className="flex-1 h-12 bg-white border-2 border-red-500 text-red-600 text-[14px] font-bold rounded-xl hover:bg-red-50 flex items-center justify-center gap-2 disabled:border-gray-200 disabled:text-gray-400 disabled:bg-gray-50 transition-colors"
        >
          <ShoppingCart size={18} strokeWidth={2.5} /> THÊM VÀO GIỎ
        </Button>
        
        <Button 
          disabled={currentVariant?.stockQuantity === 0}
          onClick={handleBuyNow}
          className="flex-1 h-12 bg-gradient-to-r from-red-600 to-red-500 text-white text-[14px] font-bold rounded-xl hover:from-red-700 hover:to-red-600 disabled:from-gray-300 disabled:to-gray-300 transition-all shadow-md hover:shadow-lg disabled:shadow-none"
        >
          MUA NGAY
        </Button>
      </div>

    </div>
  );
}