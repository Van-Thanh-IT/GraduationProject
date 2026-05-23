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

  if (isLoading) {
    return (
      <div className="w-full h-[200px] flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100">
        <Spin />
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 py-5 font-sans">
      <h3 className="text-[17px] font-bold text-gray-800 px-5 mb-4">
        Danh mục
      </h3>

      <ul className="flex flex-col">
        {categories.map((cat) => {
          const isActive = currentCategory === cat.slug;
          return (
            <li 
              key={cat.id}
              onClick={() => handleSelectCategory(cat.slug)}
              className={`flex items-center gap-4 px-5 py-2.5 cursor-pointer transition-colors ${
                isActive ? 'bg-blue-50/50 text-blue-600 font-semibold' : 'hover:bg-gray-50 text-gray-700 font-medium'
              }`}
            >
              <div className="w-7 h-7 flex items-center justify-center shrink-0">
                {cat.imageUrl ? (
                  <img 
                    src={cat.imageUrl} 
                    alt={cat.name} 
                    className="w-full h-full object-contain mix-blend-multiply" 
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-400">
                    Img
                  </div>
                )}
              </div>
              <span className="text-[15px] leading-tight">
                {cat.name}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}