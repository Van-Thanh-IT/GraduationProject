// File: src/modules/client/products/components/AdvancedFilterSidebar.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { Spin, Slider } from 'antd';
import { RightOutlined, AppstoreOutlined, TagOutlined } from '@ant-design/icons';
import { useGetHomeData } from '@/hooks/useHome';

const formatVND = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
};

const MAX_SLIDER_PRICE = 100000000; 

const PRESET_PRICES = [
  { label: 'Dưới 1 triệu', min: 0, max: 1000000 },
  { label: '1 - 3 triệu', min: 1000000, max: 3000000 },
  { label: '3 - 5 triệu', min: 3000000, max: 5000000 },
  { label: '5 - 10 triệu', min: 5000000, max: 10000000 },
  { label: '10 - 20 triệu', min: 10000000, max: 20000000 },
  { label: '20 - 30 triệu', min: 20000000, max: 30000000 },
  { label: '30 - 60 triệu', min: 30000000, max: 60000000 },
  { label: '60 - 80 triệu', min: 60000000, max: 80000000 },
  { label: 'Trên 100 triệu', min: 100000000, max: Infinity },
];

export default function AdvancedFilterSidebar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { data, isLoading } = useGetHomeData();
  const { categories = [], brands = [] } = data || {};

  const currentCategory = searchParams.get('category') || '';
  const currentBrand = searchParams.get('brand') || '';
  
  const minParam = searchParams.get('minPrice');
  const maxParam = searchParams.get('maxPrice');

  const [priceRange, setPriceRange] = useState([
    minParam ? parseInt(minParam) : 0,
    maxParam ? parseInt(maxParam) : MAX_SLIDER_PRICE
  ]);

  const [showPricePresets, setShowPricePresets] = useState(false);

  useEffect(() => {
    setPriceRange([
      minParam ? parseInt(minParam) : 0,
      maxParam ? parseInt(maxParam) : MAX_SLIDER_PRICE
    ]);
  }, [minParam, maxParam]);

  const flatCategories = useMemo(() => {
    const result = [];
    const flatten = (items) => {
      items.forEach(item => {
        result.push(item);
        if (item.children && item.children.length > 0) {
          flatten(item.children);
        }
      });
    };
    flatten(categories);
    return result;
  }, [categories]);

  const handleFilterSelect = (type, slug) => {
    if (!location.pathname.includes('/products')) {
       navigate(`/products${slug ? `?${type}=${slug}` : ''}`);
       return; 
    }

    if (searchParams.get(type) === slug) {
      searchParams.delete(type);
    } else {
      if (slug) {
        searchParams.set(type, slug);
      } else {
        searchParams.delete(type);
      }
    }
    
    searchParams.set('page', '1'); 
    setSearchParams(searchParams);
  };

  const handlePriceFilter = () => {
    if (priceRange[0] > 0) searchParams.set('minPrice', priceRange[0]);
    else searchParams.delete('minPrice');

    if (priceRange[1] < MAX_SLIDER_PRICE) searchParams.set('maxPrice', priceRange[1]);
    else searchParams.delete('maxPrice');

    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  const handlePresetClick = (min, max) => {
    setPriceRange([min, max]);
    
    if (!location.pathname.includes('/products')) {
      navigate(`/products?minPrice=${min}&maxPrice=${max}`);
      return;
    }

    if (min > 0) searchParams.set('minPrice', min);
    else searchParams.delete('minPrice');

    if (max < MAX_SLIDER_PRICE) searchParams.set('maxPrice', max);
    else searchParams.delete('maxPrice');

    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  const clearPriceFilter = () => {
    setPriceRange([0, MAX_SLIDER_PRICE]);
    searchParams.delete('minPrice');
    searchParams.delete('maxPrice');
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  if (isLoading) {
    return (
      <div className="w-full h-[200px] flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-200 shadow-sm">
        <Spin />
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 md:border-gray-200 py-3 md:py-4 font-sans shadow-sm overflow-hidden md:overflow-visible">
      
      {/* ======================= DANH MỤC (MOBILE: 1 HÀNG | PC: LIST DỌC) ======================= */}
      <div className="border-b border-gray-100 pb-3 md:pb-2">
        <h4 className="text-[13px] md:text-[14px] font-bold text-gray-500 px-4 md:px-5 mb-2 md:mb-2 uppercase tracking-wider">
          Danh mục
        </h4>
        <ul className="
          grid grid-rows-1 grid-flow-col gap-2 px-4 pb-2 
          overflow-x-auto overscroll-x-contain snap-x snap-mandatory scroll-smooth
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
          md:flex md:flex-col md:max-h-[260px] md:overflow-y-auto md:px-0 md:pb-0 md:custom-scrollbar
        ">
          <li 
            onClick={() => handleFilterSelect('category', '')}
            className={`
              snap-start flex flex-col items-center justify-start text-center w-[76px] sm:w-[84px] p-2 rounded-xl cursor-pointer transition-all border
              md:flex-row md:w-full md:border-none md:rounded-none md:px-5 md:py-2.5 md:bg-transparent md:text-left
              ${!currentCategory 
                ? 'bg-blue-50 border-blue-200 text-blue-600 font-semibold md:bg-blue-50/50 md:border-transparent' 
                : 'bg-white border-gray-100 hover:bg-gray-50 text-gray-700 font-medium md:border-transparent'
              }
            `}
          >
            <div className="w-8 h-8 md:w-6 md:h-6 shrink-0 mb-1 md:mb-0 flex items-center justify-center bg-gray-50 rounded-full md:bg-transparent md:rounded-none text-gray-400 md:text-blue-500">
              <AppstoreOutlined className="text-lg md:text-[16px]" />
            </div>
            <span className="text-[11px] md:text-[14px] leading-tight md:leading-none line-clamp-2 md:line-clamp-1 w-full md:w-auto mt-0.5 md:mt-0 md:ml-3 md:text-left">
              Tất cả
            </span>
          </li>
          
          {flatCategories.map((cat) => (
            <li 
              key={cat.id}
              onClick={() => handleFilterSelect('category', cat.slug)}
              className={`
                snap-start flex flex-col items-center justify-start text-center w-[76px] sm:w-[84px] p-2 rounded-xl cursor-pointer transition-all border
                md:flex-row md:w-full md:border-none md:rounded-none md:px-5 md:py-2.5 md:bg-transparent md:text-left
                ${currentCategory === cat.slug 
                  ? 'bg-blue-50 border-blue-200 text-blue-600 font-semibold md:bg-blue-50/50 md:border-transparent' 
                  : 'bg-white border-gray-100 hover:bg-gray-50 text-gray-700 font-medium md:border-transparent'
                }
              `}
            >
              <div className="w-8 h-8 md:w-6 md:h-6 shrink-0 mb-1 md:mb-0 flex items-center justify-center bg-gray-50 rounded-full md:bg-transparent md:rounded-none overflow-hidden">
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt="" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                ) : (
                  <AppstoreOutlined className="text-gray-300" />
                )}
              </div>
              <span className="text-[11px] md:text-[14px] leading-tight md:leading-none line-clamp-2 md:line-clamp-1 w-full md:w-auto mt-0.5 md:mt-0 md:ml-3 md:text-left">
                {cat.name}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* ======================= THƯƠNG HIỆU (MOBILE: 2 HÀNG | PC: LIST DỌC) ======================= */}
      {brands.length > 0 && (
        <div className="border-b border-gray-100 pt-3 pb-3 md:pb-2">
          <h4 className="text-[13px] md:text-[14px] font-bold text-gray-500 px-4 md:px-5 mb-2 md:mb-2 uppercase tracking-wider">
            Thương hiệu
          </h4>
          <ul className="
            grid grid-rows-2 grid-flow-col gap-2 px-4 pb-2 
            overflow-x-auto overscroll-x-contain snap-x snap-mandatory scroll-smooth
            [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
            md:flex md:flex-col md:max-h-[260px] md:overflow-y-auto md:px-0 md:pb-0 md:custom-scrollbar
          ">
            <li 
              onClick={() => handleFilterSelect('brand', '')}
              className={`
                snap-start flex flex-col items-center justify-start text-center w-[76px] sm:w-[84px] p-2 rounded-xl cursor-pointer transition-all border
                md:flex-row md:w-full md:border-none md:rounded-none md:px-5 md:py-2.5 md:bg-transparent md:text-left
                ${!currentBrand 
                  ? 'bg-blue-50 border-blue-200 text-blue-600 font-semibold md:bg-blue-50/50 md:border-transparent' 
                  : 'bg-white border-gray-100 hover:bg-gray-50 text-gray-700 font-medium md:border-transparent'
                }
              `}
            >
              <div className="w-8 h-8 md:w-6 md:h-6 shrink-0 mb-1 md:mb-0 flex items-center justify-center bg-gray-50 rounded-full md:bg-transparent md:rounded-none text-gray-400 md:text-blue-500">
                <TagOutlined className="text-lg md:text-[16px]" />
              </div>
              <span className="text-[11px] md:text-[14px] leading-tight md:leading-none line-clamp-2 md:line-clamp-1 w-full md:w-auto mt-0.5 md:mt-0 md:ml-3 md:text-left">
                Tất cả
              </span>
            </li>
            
            {brands.map((b) => (
              <li 
                key={b.id}
                onClick={() => handleFilterSelect('brand', b.slug)}
                className={`
                  snap-start flex flex-col items-center justify-start text-center w-[76px] sm:w-[84px] p-2 rounded-xl cursor-pointer transition-all border
                  md:flex-row md:w-full md:border-none md:rounded-none md:px-5 md:py-2.5 md:bg-transparent md:text-left
                  ${currentBrand === b.slug 
                    ? 'bg-blue-50 border-blue-200 text-blue-600 font-semibold md:bg-blue-50/50 md:border-transparent' 
                    : 'bg-white border-gray-100 hover:bg-gray-50 text-gray-700 font-medium md:border-transparent'
                  }
                `}
              >
                <div className="w-8 h-8 md:w-6 md:h-6 shrink-0 mb-1 md:mb-0 flex items-center justify-center bg-gray-50 rounded-full md:bg-transparent md:rounded-none overflow-hidden p-1 md:p-0">
                  {b.logoUrl ? (
                    <img src={b.logoUrl} alt="" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                  ) : (
                    <TagOutlined className="text-gray-300" />
                  )}
                </div>
                <span className="text-[11px] md:text-[14px] leading-tight md:leading-none line-clamp-2 md:line-clamp-1 w-full md:w-auto mt-0.5 md:mt-0 md:ml-3 md:text-left">
                  {b.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ======================= MỨC GIÁ & ACCORDION PRESET ======================= */}
      <div className="pt-4 px-4 md:px-5">
        <h4 className="text-[13px] md:text-[14px] font-bold text-gray-800 mb-3 md:mb-4 uppercase tracking-wider">
          Lọc theo giá
        </h4>
        
        <div className="px-1 mb-4">
          <Slider
            range
            min={0}
            max={MAX_SLIDER_PRICE}
            step={500000}
            value={priceRange}
            onChange={(val) => setPriceRange(val)}
            tooltip={{ formatter: (value) => formatVND(value) }}
          />
        </div>

        <div className="flex justify-between items-center gap-2 mb-4">
          <div className="flex-1 text-center py-2 border border-gray-200 rounded-lg text-[12px] sm:text-[13px] font-bold text-gray-800 bg-white">
            {new Intl.NumberFormat('vi-VN').format(priceRange[0])}
          </div>
          <span className="text-gray-400">-</span>
          <div className="flex-1 text-center py-2 border border-gray-200 rounded-lg text-[12px] sm:text-[13px] font-bold text-gray-800 bg-white">
            {new Intl.NumberFormat('vi-VN').format(priceRange[1])}
          </div>
        </div>
        
        <div className="flex gap-2">
           {(minParam || maxParam) && (
              <button 
                onClick={clearPriceFilter}
                className="w-1/4 py-2 text-[12px] sm:text-[13px] font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Xóa
              </button>
           )}
           <button 
              onClick={handlePriceFilter}
              className="flex-1 py-2 text-[12px] sm:text-[13px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors uppercase tracking-wider shadow-sm"
           >
              Áp dụng
           </button>
        </div>

        {/* CÁC NÚT KHOẢNG GIÁ CHỌN NHANH - CÓ ACCORDION ĐÓNG/MỞ */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => setShowPricePresets(!showPricePresets)}
            className="flex items-center justify-between w-full py-1 text-[13px] font-bold text-gray-600 hover:text-blue-600 transition-colors uppercase tracking-wider"
          >
            <span>Mức giá phổ biến</span>
            <RightOutlined className={`text-[11px] transition-transform duration-300 ${showPricePresets ? 'rotate-90' : ''}`} />
          </button>
          
          <div 
            className={`grid grid-cols-2 gap-2 overflow-hidden transition-all duration-300 origin-top ${
              showPricePresets ? 'max-h-[500px] mt-3 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            {PRESET_PRICES.map((preset, idx) => {
              const isSelected = priceRange[0] === preset.min && priceRange[1] === preset.max;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetClick(preset.min, preset.max)}
                  className={`w-full py-2 text-[12px] font-medium rounded-lg border transition-colors text-center ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold' 
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}