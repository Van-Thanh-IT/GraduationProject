// File: src/modules/client/home/components/CategorySidebar.jsx
import React, { useMemo } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useGetHomeData } from '@/hooks/useHome';

export default function CategorySidebar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { data, isLoading } = useGetHomeData();
  const currentCategory = searchParams.get('category') || '';
  const rawCategories = data?.categories || [];

  // Flatten mảng danh mục lồng nhau thành mảng 1 cấp
  const categories = useMemo(() => {
    const flatList = [];
    const flatten = (items) => {
      items.forEach(item => {
        flatList.push(item);
        if (item.children && item.children.length > 0) {
          flatten(item.children);
        }
      });
    };
    flatten(rawCategories);
    return flatList;
  }, [rawCategories]);

  // Xử lý logic chọn danh mục
  const handleSelectCategory = (slug) => {
    if (!location.pathname.includes('/products')) {
       navigate(`/products${slug ? `?category=${slug}` : ''}`);
       return; 
    }

    if (currentCategory === slug) {
      searchParams.delete('category');
    } else {
      if (slug) {
        searchParams.set('category', slug);
      } else {
        searchParams.delete('category');
      }
    }
    
    searchParams.set('page', '1'); 
    setSearchParams(searchParams);
  };

  // Trạng thái Loading
  if (isLoading) {
    return (
      <div className="w-full h-[200px] flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100">
        <Spin />
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 py-3 md:py-5 font-sans overflow-hidden">
      <h3 className="text-[15px] md:text-[17px] font-bold text-gray-800 px-4 md:px-5 mb-3 md:mb-4">
        Danh mục
      </h3>

      <ul className="
        grid grid-rows-2 grid-flow-col gap-x-2 gap-y-3 px-4 pb-2 
        overflow-x-auto overscroll-x-contain snap-x snap-mandatory scroll-smooth
        [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
        md:flex md:flex-col md:overflow-visible md:p-0 md:gap-0
      ">
        {categories.map((cat) => {
          const isActive = currentCategory === cat.slug;
          
          return (
            <li 
              key={cat.id}
              onClick={() => handleSelectCategory(cat.slug)}
              className={`
                snap-start flex flex-col items-center text-center w-[72px] sm:w-[84px] p-2 rounded-xl cursor-pointer transition-all
                md:flex-row md:text-left md:w-full md:rounded-none md:px-5 md:py-2.5 md:gap-4
                ${isActive 
                  ? 'bg-blue-50/80 text-blue-600 font-bold md:bg-blue-50/50 md:border-r-2 md:border-blue-600' 
                  : 'hover:bg-gray-50 text-gray-700 font-medium'
                }
              `}
            >
              {/* Box chứa Icon/Ảnh */}
              <div className="w-10 h-10 md:w-7 md:h-7 mb-1.5 md:mb-0 flex items-center justify-center shrink-0 bg-gray-50/50 rounded-full md:rounded-none md:bg-transparent">
                {cat.imageUrl ? (
                  <img 
                    src={cat.imageUrl} 
                    alt={cat.name} 
                    className="w-full h-full object-contain mix-blend-multiply" 
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 rounded-full md:rounded flex items-center justify-center text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    Pic
                  </div>
                )}
              </div>

              {/* Tên Danh mục */}
              <span className="text-[11px] md:text-[15px] leading-tight line-clamp-2 md:line-clamp-1 w-full">
                {cat.name}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}