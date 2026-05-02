import React, { useState } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import { 
  FilterOutlined, 
  AppstoreOutlined, 
  RightOutlined,
  CrownOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useGetHomeData } from '@/hooks/useHome';

export default function AdvancedFilterSidebar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { data, isLoading } = useGetHomeData();
  const { categories = [], brands = [] } = data || {};

  // Lấy state từ URL
  const currentCategory = searchParams.get('category') || '';
  const currentBrand = searchParams.get('brand') || '';
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  // Hàm xử lý chung khi click vào 1 Filter (Category hoặc Brand)
  const handleFilterSelect = (type, slug) => {
    if (!location.pathname.includes('/products')) {
       navigate(`/products${slug ? `?${type}=${slug}` : ''}`);
       return; 
    }

    const currentValue = searchParams.get(type);
    if (currentValue === slug) {
      searchParams.delete(type); // Bấm lại thì hủy lọc
    } else {
      if (slug) searchParams.set(type, slug);
      else searchParams.delete(type); // Dành cho nút "Tất cả"
    }
    
    searchParams.set('page', '1'); 
    setSearchParams(searchParams);
  };

  // Xử lý Lọc Giá
  const handlePriceFilter = () => {
    if (minPrice) searchParams.set('minPrice', minPrice);
    else searchParams.delete('minPrice');

    if (maxPrice) searchParams.set('maxPrice', maxPrice);
    else searchParams.delete('maxPrice');

    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  // Reset Giá
  const clearPriceFilter = () => {
    setMinPrice('');
    setMaxPrice('');
    searchParams.delete('minPrice');
    searchParams.delete('maxPrice');
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  if (isLoading) {
    return (
      <div className="w-full h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-100">
        <Spin />
        <span className="text-slate-500 font-medium mt-3 text-sm">Đang tải bộ lọc...</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      
      {/* HEADER SIDEBAR */}
      <div className="bg-indigo-600 px-5 py-3.5 flex items-center gap-2 text-white">
        <FilterOutlined className="text-lg" />
        <h3 className="font-black text-[15px] m-0 uppercase tracking-wide">BỘ LỌC TÌM KIẾM</h3>
      </div>

      {/* ================= KHỐI 1: LỌC THEO DANH MỤC ================= */}
      <div className="p-4 md:p-5 border-b border-slate-100">
        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-[14px] uppercase tracking-wider">
          <AppstoreOutlined className="text-indigo-500" /> Theo Danh Mục
        </h4>
        <ul className="space-y-1.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
          <li>
            <div onClick={() => handleFilterSelect('category', '')} className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all ${!currentCategory ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
              Tất cả danh mục
            </div>
          </li>
          {categories.map((parent) => {
            const isParentActive = currentCategory === parent.slug;
            const hasChildren = parent.children && parent.children.length > 0;
            const isChildActive = hasChildren && parent.children.some(c => c.slug === currentCategory);

            return (
              <li key={parent.id} className="pt-1">
                <div onClick={() => handleFilterSelect('category', parent.slug)} className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all ${isParentActive || isChildActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}>
                   {parent.imageUrl && <img src={parent.imageUrl} alt="" className="w-5 h-5 object-contain" />}
                   <span className="flex-1 text-[13.5px]">{parent.name}</span>
                </div>
                {hasChildren && (
                  <ul className="pl-8 pr-2 mt-1 space-y-1 border-l-2 border-slate-50 ml-6">
                    {parent.children.map(child => (
                      <li key={child.id}>
                        <div onClick={() => handleFilterSelect('category', child.slug)} className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] cursor-pointer transition-all ${currentCategory === child.slug ? 'text-indigo-700 font-bold bg-indigo-50/50' : 'text-slate-500 hover:text-indigo-600'}`}>
                           <span>{child.name}</span>
                           {currentCategory === child.slug && <RightOutlined className="text-[10px]" />}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* ================= KHỐI 2: LỌC THEO THƯƠNG HIỆU ================= */}
      {brands.length > 0 && (
        <div className="p-4 md:p-5 border-b border-slate-100">
          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-[14px] uppercase tracking-wider">
            <CrownOutlined className="text-blue-500" /> Thương Hiệu
          </h4>
          <div className="flex flex-wrap gap-2">
            {brands.map((b) => (
              <div 
                key={b.id}
                onClick={() => handleFilterSelect('brand', b.slug)}
                className={`px-3 py-1.5 border rounded-lg text-[13px] font-semibold cursor-pointer transition-all ${currentBrand === b.slug ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-blue-300'}`}
              >
                {b.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= KHỐI 3: KHOẢNG GIÁ ================= */}
      <div className="p-4 md:p-5 bg-slate-50/50">
        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-[14px] uppercase tracking-wider">
          <DollarOutlined className="text-emerald-500" /> Khoảng Giá (VNĐ)
        </h4>
        <div className="flex items-center gap-2 mb-3">
          <input 
            type="number" 
            placeholder="TỪ" 
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" 
          />
          <span className="text-slate-400">-</span>
          <input 
            type="number" 
            placeholder="ĐẾN" 
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" 
          />
        </div>
        <div className="flex gap-2">
           {(minPrice || maxPrice || searchParams.get('minPrice')) && (
              <button 
                onClick={clearPriceFilter}
                className="flex-1 py-2 text-[13px] font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Xóa
              </button>
           )}
           <button 
              onClick={handlePriceFilter}
              className="flex-1 py-2 text-[13px] font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
           >
              Áp dụng
           </button>
        </div>
      </div>

    </div>
  );
}