// File: src/modules/client/home/components/HeroBanner.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Spin } from 'antd';
import { useGetBanners } from '@/hooks/useBanners';

export default function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: bannerData, isLoading, isError } = useGetBanners('HOME_MAIN_SLIDER');

  const banners = Array.isArray(bannerData) ? bannerData : [];
  const hasBanners = banners.length > 0;

  const nextSlide = useCallback(() => {
    if (!hasBanners) return;
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length, hasBanners]);

  const prevSlide = useCallback(() => {
    if (!hasBanners) return;
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length, hasBanners]);

  useEffect(() => {
    if (!hasBanners) return;
    const interval = setInterval(nextSlide, 3500); // 3.5 giây tự chuyển slide chuẩn mượt
    return () => clearInterval(interval);
  }, [nextSlide, hasBanners]);

  if (isLoading) {
    return (
      <div className="w-full aspect-[21/8] rounded-xl bg-white flex items-center justify-center border border-gray-200">
        <Spin />
      </div>
    );
  }

  if (isError || !hasBanners) return null;

  return (
    <div className="relative group w-full aspect-[21/8] overflow-hidden rounded-xl border border-gray-200 bg-white font-sans select-none">
      
      {/* VÙNG HIỂN THỊ BANNER */}
      {banners.map((banner, index) => {
        const mobileImage = banner.mobileImageUrl || banner.imageUrl;
        const isActive = index === currentIndex;
        const hasLink = !!banner.targetUrl;

        // Nội dung ảnh bọc trong thẻ bốc đầu liên kết nếu có targetUrl
        const BannerContent = (
          <picture className="w-full h-full block">
            <source media="(max-width: 768px)" srcSet={mobileImage} />
            <img 
              src={banner.imageUrl} 
              alt={banner.title || 'Banner'} 
              className="w-full h-full object-fill md:object-cover" 
              loading={index === 0 ? "eager" : "lazy"}
            />
          </picture>
        );

        return (
          <div
            key={banner.id}
            className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
              isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {hasLink ? (
              <a 
                href={banner.targetUrl}
                rel="noopener noreferrer"
                className="w-full h-full block cursor-pointer"
              >
                {BannerContent}
              </a>
            ) : (
              <div className="w-full h-full block cursor-default">
                {BannerContent}
              </div>
            )}
          </div>
        );
      })}

      {/* ĐIỀU HƯỚNG MŨI TÊN TRÊN BANNER (Chỉ hiện khi > 1 ảnh) */}
      {banners.length > 1 && (
        <>
          <button 
            type="button"
            onClick={prevSlide} 
            className="absolute top-1/2 left-3 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-700 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center border border-gray-200 cursor-pointer shadow-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
          </button>
          
          <button 
            type="button"
            onClick={nextSlide} 
            className="absolute top-1/2 right-3 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-700 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center border border-gray-200 cursor-pointer shadow-sm"
            aria-label="Next slide"
          >
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>

          {/* DẢI CHẤM CHUYỂN SLIDE PHẲNG DẸT THEO KIỂU HOÀNG HÀ MOBILE */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {banners.map((_, index) => (
              <button
                key={`dot-${index}`}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  index === currentIndex ? 'w-5 bg-blue-600' : 'w-1.5 bg-gray-300/70 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}