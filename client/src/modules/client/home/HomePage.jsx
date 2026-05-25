// File: src/modules/client/home/Home.jsx
import React from 'react';
import { Spin } from 'antd';
import { useGetHomeData } from '@/hooks/useHome';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';

import CategorySidebar from './components/CategorySidebar';
import ProductCard from '@/modules/client/products/components/ProductCard'; 
import HeroBanner from './components/HeroBanner';
import NewsSection from './components/ArticleSection';
import BrandSection from './components/BrandSection';

// Import CSS bắt buộc của Swiper
import 'swiper/css';
import 'swiper/css/navigation';

const HomePage = () => {
  const { data, isLoading } = useGetHomeData();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center bg-slate-50 px-4">
        <Spin size="large" />
        <p className="mt-3 text-slate-500 font-medium text-xs sm:text-sm">Đang tải cửa hàng...</p>
      </div>
    );
  }

  const { 
    bestSellers = [], 
    defaultProducts = [], 
    flashSales = [], 
    brands = [] 
  } = data || {};

  // Điều kiện kích hoạt slider cho Flash Sale
  const isFlashSaleSliderRequired = flashSales.length > 2;

  return (
    <div className="w-full bg-slate-50 pb-6 md:pb-8 font-sans overflow-hidden">
      <div className="max-w-[1200px] lg:max-w-[1400px] mx-auto px-2.5 sm:px-4 md:px-6 py-2 md:py-4">
        
        <div className="flex flex-col md:flex-row gap-3 lg:gap-4 items-start">
           
           {/* SIDEBAR DANH MỤC - Cố định kích thước chuẩn ở màn máy tính */}
           <div className="hidden md:block w-[220px] lg:w-[260px] shrink-0 sticky h-max z-30"
              style={{ top: "calc(var(--header-height) + 16px)" }}>
              <CategorySidebar />
           </div>
           
           {/* CONTENT CHÍNH - Chống tràn layout trên Mobile di động cực tốt */}
           <div className="flex-1 min-w-0 w-full space-y-4 md:space-y-6">
              
              <div className="w-full rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                 <HeroBanner />
              </div>

              <BrandSection brands={brands} />

              {/* ================= SECTION: FLASH SALE (TỰ ĐỘNG SLIDER CHUẨN UX) ================= */}
              {flashSales.length > 0 && (
                <section className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-3 md:p-4 shadow-sm relative group/flashsale overflow-hidden">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2 text-white">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-black italic uppercase m-0 tracking-tight">
                        ⚡ Flash Sale
                      </h2>
                    </div>
                    
                    <Link to="/products?isFlashSale=true&page=1" className="text-white font-bold text-[11px] sm:text-xs bg-white/20 px-2.5 py-1.5 rounded-full hover:bg-white/30 transition-all flex items-center gap-1">
                      Xem tất cả <RightOutlined className="text-[8px]" />
                    </Link>
                  </div>
                  
                  {/* Khu vực chứa danh sách / Slider sản phẩm */}
                  <div className="relative px-0.5">
                    <Swiper
                      modules={[Autoplay, Navigation]}
                      spaceBetween={8}
                      slidesPerView={2} // Màn hình dọc điện thoại nhỏ hiển thị 2 cột vừa khít
                      allowTouchMove={isFlashSaleSliderRequired}
                      autoplay={
                        isFlashSaleSliderRequired
                          ? {
                              delay: 3000,
                              disableOnInteraction: false,
                              pauseOnMouseEnter: true,
                            }
                          : false
                      }
                      navigation={{
                        prevEl: '.fs-prev-btn',
                        nextEl: '.fs-next-btn',
                      }}
                      breakpoints={{
                        // Từ màn hình Smartphone nằm ngang / Máy tính bảng cỡ nhỏ trở lên
                        480: { slidesPerView: 2, spaceBetween: 10 },
                        640: { slidesPerView: 3, spaceBetween: 12 },
                        1024: { slidesPerView: 4, spaceBetween: 12 },
                        1280: { slidesPerView: 5, spaceBetween: 12 }, 
                      }}
                      className="w-full"
                    >
                      {flashSales.map(p => (
                        <SwiperSlide key={`fs-${p.id}`} className="h-auto flex">
                          <ProductCard product={p} />
                        </SwiperSlide>
                      ))}
                    </Swiper>

                    {/* NÚT BẤM ĐIỀU HƯỚNG < > (Chỉ hiện từ màn hình tablet trở lên khi hover) */}
                    {isFlashSaleSliderRequired && (
                      <>
                        <button 
                          type="button"
                          className="fs-prev-btn absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 w-8 h-8 rounded-full bg-white/90 border border-gray-200 shadow-md text-gray-700 hover:text-red-500 hidden md:flex items-center justify-center transition-all opacity-0 group-hover/flashsale:opacity-100 group-hover/flashsale:translate-x-0"
                          aria-label="Previous flash sales"
                        >
                          <LeftOutlined className="text-[11px] font-bold" />
                        </button>
                        <button 
                          type="button"
                          className="fs-next-btn absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 w-8 h-8 rounded-full bg-white/90 border border-gray-200 shadow-md text-gray-700 hover:text-red-500 hidden md:flex items-center justify-center transition-all opacity-0 group-hover/flashsale:opacity-100 group-hover/flashsale:-translate-x-0"
                          aria-label="Next flash sales"
                        >
                          <RightOutlined className="text-[11px] font-bold" />
                        </button>
                      </>
                    )}
                  </div>
                </section>
              )}

              {/* ================= SECTION: BÁN CHẠY NHẤT ================= */}
              {bestSellers.length > 0 && (
                <section className="bg-white p-3 sm:p-4 lg:p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                    <h2 className="text-[15px] sm:text-[17px] lg:text-lg font-bold text-gray-800 uppercase tracking-wide m-0">
                      Bán chạy nhất
                    </h2>
                    <Link to="/products" className="text-blue-600 font-semibold text-xs sm:text-[13px] flex items-center gap-1 hover:text-blue-700 transition-colors group">
                      Xem tất cả <RightOutlined className="text-[9px] group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                  
                  {/* Thay thế grid cứng thành hệ thống cột co giãn thông minh linh hoạt */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                    {bestSellers.map((product) => (
                      <ProductCard key={`best-${product.id}`} product={product} />
                    ))}
                  </div>
                </section>
              )}

              {/* ================= SECTION: GỢI Ý CHO BẠN ================= */}
              {defaultProducts.length > 0 && (
                <section className="bg-white p-3 sm:p-4 lg:p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                    <h2 className="text-[15px] sm:text-[17px] lg:text-lg font-bold text-gray-800 uppercase tracking-wide m-0">
                      Gợi ý cho bạn
                    </h2>
                    <Link to="/products" className="text-blue-600 font-semibold text-xs sm:text-[13px] flex items-center gap-1 hover:text-blue-700 transition-colors group">
                      Xem tất cả <RightOutlined className="text-[9px] group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                  
                  {/* Hệ thống grid nâng cấp hỗ trợ hiển thị 3 cột trên tablet cỡ trung */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                    {defaultProducts.map((product) => (
                      <ProductCard key={`def-${product.id}`} product={product} />
                    ))}
                  </div>
                </section>
              )}

           </div>
        </div>
      </div>

      {/* SECTION TIN TỨC */}
      <div className="mt-4 bg-white border-t border-gray-200 py-4">
        <div className="max-w-[1200px] lg:max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6">
           <NewsSection />
        </div>
      </div>

    </div>
  );
}

export default HomePage;