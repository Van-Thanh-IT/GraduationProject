import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CrownFilled, RightOutlined } from '@ant-design/icons';

export default function BrandSection({ brands }) {
  const navigate = useNavigate();

  // Nếu không có thương hiệu nào thì ẩn section này đi
  if (!brands || brands.length === 0) return null;

  return (
    <section className="bg-white p-5 lg:p-7 rounded-2xl shadow-sm border border-slate-100">
      
      {/* Tiêu đề Section */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
        <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 m-0">
          <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
            <CrownFilled />
          </div>
          THƯƠNG HIỆU CHÍNH HÃNG
        </h2>
        <button 
          onClick={() => navigate('/products?brands')}
          className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:text-indigo-700 transition-colors group"
        >
          Xem tất cả <RightOutlined className="text-[10px] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Lưới Logo Thương hiệu */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
        {brands.map((brand) => (
          <div
            key={brand.id}
            // Bấm vào Logo -> Chuyển sang trang Products kèm filter brand
            onClick={() => navigate(`/products?brand=${brand.slug}`)}
            className="cursor-pointer group flex flex-col items-center gap-2"
          >
            {/* Hộp chứa Logo */}
            <div className="w-full aspect-[2/1] md:aspect-video rounded-xl border border-slate-100 bg-white p-2 md:p-4 flex items-center justify-center transition-all duration-300 group-hover:border-blue-400 group-hover:shadow-md">
              <img 
                src={brand.logoUrl} 
                alt={brand.name} 
                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300" 
              />
            </div>
            {/* Tên thương hiệu */}
            <span className="text-[13px] font-bold text-slate-600 group-hover:text-blue-600 line-clamp-1 text-center transition-colors">
              {brand.name}
            </span>
          </div>
        ))}
      </div>

    </section>
  );
}