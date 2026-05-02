// File: src/components/HeroBanner.jsx (hoặc đường dẫn tương ứng)
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Spin } from 'antd'; // Tùy chọn: dùng Spin của AntD cho trạng thái loading
import { useGetBanners } from '@/hooks/useBanners'; // Import hook bạn vừa tạo

export default function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // GỌI API THÔNG QUA HOOK
  const { data: bannerData, isLoading, isError } = useGetBanners('HOME_MAIN_SLIDER');

  // Đảm bảo bannerData luôn là một mảng
  const banners = Array.isArray(bannerData) ? bannerData : [];
  const hasBanners = banners.length > 0;

  // Các hàm điều khiển slide
  const nextSlide = useCallback(() => {
    if (!hasBanners) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  }, [banners.length, hasBanners]);

  const prevSlide = () => {
    if (!hasBanners) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
  };

  // Tự động nhảy slide
  useEffect(() => {
    if (!hasBanners) return;
    const slideInterval = setInterval(nextSlide, 5000);
    return () => clearInterval(slideInterval);
  }, [nextSlide, hasBanners]);

  // XỬ LÝ TRẠNG THÁI LOADING & ERROR
  if (isLoading) {
    return (
      <div className="w-full aspect-[2/1] md:aspect-[21/9] rounded-2xl bg-gray-100 flex items-center justify-center border border-gray-200">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !hasBanners) {
    // Trả về null hoặc một banner giữ chỗ (placeholder) nếu không có data
    return null;
  }

  return (
    <div className="relative group w-full aspect-[2/1] md:aspect-[21/9] overflow-hidden rounded-2xl border border-gray-100 shadow-lg bg-gray-900">
      
      {/* KHU VỰC RENDER BANNER */}
      {banners.map((banner, index) => {
        // Fallback: Nếu không có ảnh mobile, dùng ảnh desktop
        const mobileImage = banner.mobileImageUrl || banner.imageUrl;
        // Dựa vào dữ liệu từ Backend, bạn có thể cần điều chỉnh logic style (dark/light)
        // Hiện tại giả định mặc định là text sáng (dark style) vì bạn đang có nền gradient tối
        
        return (
          <div
            key={banner.id}
            className={`absolute inset-0 w-full h-full flex transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
           {/* 1. HÌNH ẢNH NỀN */}
            <picture className="absolute inset-0 w-full h-full">
              {/* Sửa 'max-w' thành 'max-width' */}
              <source media="(max-width: 768px)" srcSet={mobileImage} />
              
              {/* Đảm bảo thẻ img có w-full h-full object-cover */}
              <img 
                src={banner.imageUrl} 
                alt={banner.title || 'Banner'} 
                className="w-full h-full object-cover" 
              />
            </picture>

            {/* 2. LỚP PHỦ MÀU (Làm tối một bên để chữ dễ đọc) */}
            {/* Nếu backend không có trường color, ta dùng gradient đen mặc định */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/40 to-transparent"></div>

            {/* 3. NỘI DUNG VĂN BẢN */}
            <div className="relative z-10 h-full w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 flex flex-col justify-center items-center md:items-start text-center md:text-left">
              
              {/* Tiêu đề */}
              {banner.title && (
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tighter mb-4 max-w-xl text-white">
                  {banner.title}
                </h1>
              )}

              {/* Nút CTA (Nếu có targetUrl) */}
              {banner.targetUrl && (
                <a 
                  href={banner.targetUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2.5 px-8 py-3.5 mt-2 rounded-full text-base font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 bg-blue-600 text-white hover:bg-blue-700"
                >
                  Khám phá ngay
                  <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
                </a>
              )}
            </div>
          </div>
        );
      })}

      {/* 4. ĐIỀU HƯỚNG TRÁI/PHẢI (Chỉ hiện khi có > 1 banner) */}
      {banners.length > 1 && (
        <>
          <button 
            onClick={prevSlide} 
            className="absolute top-1/2 left-4 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={nextSlide} 
            className="absolute top-1/2 right-4 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>

          {/* 5. CÁC NÚT CHẤM (Dots) */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
            {banners.map((_, index) => (
              <button
                key={`dot-${index}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'w-8 bg-blue-500' : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}