// File: src/modules/client/home/components/BrandSection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';

export default function BrandSection({ brands = [] }) {
  const navigate = useNavigate();

  if (!brands || brands.length === 0) return null;

  // Kiểm tra điều kiện để bật tính năng Slider (nếu > 6 thương hiệu)
  const isSliderRequired = brands.length > 6;

  return (
    <section className="bg-white p-4 rounded-xl border border-gray-200 font-sans relative group/section">
      
      {/* TIÊU ĐỀ SECTION */}
      <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-gray-100">
        <h2 className="text-[16px] lg:text-lg font-bold text-gray-800 uppercase tracking-wide m-0">
          Thương hiệu chính hãng
        </h2>
        <button 
          type="button"
          onClick={() => navigate('/products?brands')}
          className="text-blue-600 font-semibold text-[13px] flex items-center gap-0.5 hover:text-blue-700 transition-colors group"
        >
          Xem tất cả <RightOutlined className="text-[10px] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* VÙNG CHỨA SLIDER / GRID */}
      <div className="relative px-1">
        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={12}
          slidesPerView={3} // Mặc định mobile hiện 3 cột
          allowTouchMove={isSliderRequired} // Chỉ cho vuốt trượt khi cần slider
          autoplay={
            isSliderRequired
              ? {
                  delay: 3000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
              : false
          }
          navigation={{
            prevEl: '.brand-prev-btn',
            nextEl: '.brand-next-btn',
          }}
          breakpoints={{
            // Trên tablet (md) hiện 4 cột
            768: {
              slidesPerView: 4,
              spaceBetween: 16,
            },
            // Trên desktop (lg) hiện 6 cột
            1024: {
              slidesPerView: 6,
              spaceBetween: 16,
            },
          }}
          className="w-full"
        >
          {brands.map((brand) => (
            <SwiperSlide key={brand.id}>
              <div
                onClick={() => navigate(`/products?brand=${brand.slug}`)}
                className="cursor-pointer group flex flex-col items-center gap-2 py-0.5"
              >
                <div className="w-full h-14 md:h-16 rounded-lg border border-gray-200 bg-white flex items-center justify-center transition-colors group-hover:border-blue-400">
                  <img 
                    src={brand.logoUrl} 
                    alt={brand.name} 
                    className="max-w-[70%] max-h-[60%] object-contain mix-blend-multiply transition-transform group-hover:scale-103 duration-300" 
                  />
                </div>
                <span className="text-[12px] md:text-[13px] font-medium text-gray-600 group-hover:text-blue-600 line-clamp-1 text-center transition-colors">
                  {brand.name}
                </span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* NÚT CLICK ĐIỀU HƯỚNG < > (Chỉ hiển thị khi có nhiều hơn 6 thương hiệu) */}
        {isSliderRequired && (
          <>
            <button 
              type="button"
              className="brand-prev-btn absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm text-gray-500 hover:text-blue-600 hover:border-blue-400 flex items-center justify-center transition-all opacity-0 group-hover/section:opacity-100 group-hover/section:translate-x-0"
              aria-label="Previous brands"
            >
              <LeftOutlined className="text-[11px]" />
            </button>
            <button 
              type="button"
              className="brand-next-btn absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm text-gray-500 hover:text-blue-600 hover:border-blue-400 flex items-center justify-center transition-all opacity-0 group-hover/section:opacity-100 group-hover/section:-translate-x-0"
              aria-label="Next brands"
            >
              <RightOutlined className="text-[11px]" />
            </button>
          </>
        )}
      </div>

    </section>
  );
}