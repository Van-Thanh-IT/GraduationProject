import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { Spin, Slider } from 'antd';
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
      <div className="w-full h-[200px] flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-200">
        <Spin />
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 py-4 font-sans">
      
      <div className="border-b border-gray-100 pb-2">
        <h4 className="text-[14px] font-bold text-gray-500 px-5 mb-2 uppercase tracking-wider">
          Danh mục
        </h4>
        <ul className="flex flex-col max-h-[240px] overflow-y-auto custom-scrollbar">
          <li 
            onClick={() => handleFilterSelect('category', '')}
            className={`flex items-center gap-3 px-5 py-2 cursor-pointer text-[14px] ${
              !currentCategory ? 'bg-blue-50/50 text-blue-600 font-semibold' : 'hover:bg-gray-50 text-gray-700 font-medium'
            }`}
          >
            <span className="leading-none">Tất cả danh mục</span>
          </li>
          {flatCategories.map((cat) => (
            <li 
              key={cat.id}
              onClick={() => handleFilterSelect('category', cat.slug)}
              className={`flex items-center gap-3 px-5 py-2 cursor-pointer text-[14px] ${
                currentCategory === cat.slug ? 'bg-blue-50/50 text-blue-600 font-semibold' : 'hover:bg-gray-50 text-gray-700 font-medium'
              }`}
            >
              {cat.imageUrl && (
                <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                  <img src={cat.imageUrl} alt="" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                </div>
              )}
              <span className="leading-none">{cat.name}</span>
            </li>
          ))}
        </ul>
      </div>

      {brands.length > 0 && (
        <div className="border-b border-gray-100 pt-3 pb-2">
          <h4 className="text-[14px] font-bold text-gray-500 px-5 mb-2 uppercase tracking-wider">
            Thương hiệu
          </h4>
          <ul className="flex flex-col max-h-[240px] overflow-y-auto custom-scrollbar">
            <li 
              onClick={() => handleFilterSelect('brand', '')}
              className={`flex items-center gap-3 px-5 py-2 cursor-pointer text-[14px] ${
                !currentBrand ? 'bg-blue-50/50 text-blue-600 font-semibold' : 'hover:bg-gray-50 text-gray-700 font-medium'
              }`}
            >
              <span className="leading-none">Tất cả thương hiệu</span>
            </li>
            {brands.map((b) => (
              <li 
                key={b.id}
                onClick={() => handleFilterSelect('brand', b.slug)}
                className={`flex items-center gap-3 px-5 py-2 cursor-pointer text-[14px] ${
                  currentBrand === b.slug ? 'bg-blue-50/50 text-blue-600 font-semibold' : 'hover:bg-gray-50 text-gray-700 font-medium'
                }`}
              >
                {b.logoUrl && (
                  <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                    <img src={b.logoUrl} alt="" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                  </div>
                )}
                <span className="leading-none">{b.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* KHỐI LỌC MỨC GIÁ CHUẨN THEO HÌNH ẢNH */}
      <div className="pt-3 px-5">
        <h4 className="text-[14px] font-bold text-gray-800 mb-3 uppercase tracking-wider">
          Mức giá
        </h4>
        
        <div className="px-1 mb-3">
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
          <div className="flex-1 text-center py-2 border border-gray-200 rounded-lg text-[13px] font-bold text-gray-800 bg-white">
            {new Intl.NumberFormat('vi-VN').format(priceRange[0])}
          </div>
          <span className="text-gray-400">-</span>
          <div className="flex-1 text-center py-2 border border-gray-200 rounded-lg text-[13px] font-bold text-gray-800 bg-white">
            {new Intl.NumberFormat('vi-VN').format(priceRange[1])}
          </div>
        </div>
        
        <div className="flex gap-2 mb-4">
           {(minParam || maxParam) && (
              <button 
                onClick={clearPriceFilter}
                className="w-1/4 py-2 text-[13px] font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Xóa
              </button>
           )}
           <button 
              onClick={handlePriceFilter}
              className="flex-1 py-2 text-[13px] font-bold text-white bg-blue-600 hover:bg-teal-700 rounded-lg transition-colors uppercase tracking-wider"
           >
              Áp dụng
           </button>
        </div>

        {/* CÁC NÚT KHOẢNG GIÁ CHỌN NHANH */}
        <div className="flex flex-col gap-2">
          {PRESET_PRICES.map((preset, idx) => {
            const isSelected = priceRange[0] === preset.min && priceRange[1] === preset.max;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handlePresetClick(preset.min, preset.max)}
                className={`w-full py-2.5 text-[13px] font-medium rounded-lg border transition-colors text-center ${
                  isSelected 
                    ? 'border-teal-600 bg-teal-50 text-teal-700 font-semibold' 
                    : 'border-transparent bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}