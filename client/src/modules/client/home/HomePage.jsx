// File: src/modules/client/home/Home.jsx
import React from 'react';
import { Spin } from 'antd';
import { useGetHomeData } from '@/hooks/useHome';
import { FireFilled, BulbFilled, RightOutlined, ThunderboltFilled } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import CategorySidebar from './components/CategorySidebar';
import ProductCard from '@/modules/client/products/components/ProductCard'; 
import HeroBanner from './components/HeroBanner';
import NewsSection from './components/ArticleSection';
import BrandSection from './components/BrandSection';

const HomePage = () => {
  const { data, isLoading } = useGetHomeData();

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center bg-slate-50">
        <Spin size="large" />
        <p className="mt-4 text-slate-500 font-medium tracking-wide">Đang tải cửa hàng...</p>
      </div>
    );
  }

  // Bóc tách data
  const { 
    bestSellers = [], 
    defaultProducts = [], 
    flashSales = [], 
    brands = [] 
  } = data || {};

  return (
    <div className="w-full bg-slate-50/80 min-h-screen pb-12">
      <div className="max-w-[1200px] lg:max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 pt-6">
        
        <div className="flex flex-col md:flex-row gap-6 items-start">
         
           
           {/* SIDEBAR */}
           <div className="hidden md:block w-[260px] lg:w-[280px] shrink-0 sticky top-40 h-max z-30">
              <CategorySidebar/>
           </div>
           
           {/* CONTENT CHÍNH */}
           <div className="flex-1 min-w-0 space-y-8 lg:space-y-10">
              
              <div className="w-full rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                 <HeroBanner />
              </div>

              <BrandSection brands={brands} />

              {/* ================= SECTION FLASH SALE ================= */}
              {flashSales.length > 0 && (
                <section className="bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl p-5 lg:p-7 shadow-xl shadow-orange-200/50">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3 text-white">
                      <ThunderboltFilled className="text-3xl text-yellow-300 animate-pulse" />
                      <h2 className="text-2xl lg:text-3xl font-black italic tracking-tighter uppercase m-0 drop-shadow-sm">FLASH SALE</h2>
                      {/* ĐÃ BỎ COUNTDOWN TIMER Ở ĐÂY */}
                    </div>
                    
                    <Link to="/products?isFlashSale=true&page=1" className="text-white font-bold text-sm bg-white/20 px-4 py-2 rounded-full hover:bg-white/30 transition-all flex items-center gap-2">
                      Xem tất cả <RightOutlined className="text-[10px]" />
                    </Link>
                  </div>
                  
                  {/* Grid sản phẩm Flash Sale */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {flashSales.map(p => (
                      <ProductCard key={`fs-${p.id}`} product={p} />
                    ))}
                  </div>
                </section>
              )}

              {/* ================= SECTION 1: BÁN CHẠY NHẤT ================= */}
              {bestSellers.length > 0 && (
                <section className="bg-white p-5 lg:p-7 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
                    <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 m-0">
                      <div className="p-1.5 bg-rose-100 text-rose-500 rounded-lg"><FireFilled /></div>
                      BÁN CHẠY NHẤT
                    </h2>
                    <Link to="/products" className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:text-indigo-700 transition-colors group">
                      Xem tất cả <RightOutlined className="text-[10px] group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                    {bestSellers.map((product) => (
                      <ProductCard key={`best-${product.id}`} product={product} />
                    ))}
                  </div>
                </section>
              )}

              {/* ================= SECTION 2: GỢI Ý CHO BẠN ================= */}
              {defaultProducts.length > 0 && (
                <section className="bg-white p-5 lg:p-7 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
                    <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 m-0">
                      <div className="p-1.5 bg-amber-100 text-amber-500 rounded-lg"><BulbFilled /></div>
                      GỢI Ý CHO BẠN
                    </h2>
                      <Link to="/products" className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:text-indigo-700 transition-colors group">
                      Xem tất cả <RightOutlined className="text-[10px] group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                    {defaultProducts.map((product) => (
                      <ProductCard key={`def-${product.id}`} product={product} />
                    ))}
                  </div>
                </section>
              )}

           </div>
        </div>
      </div>

      <div className="mt-12 bg-white border-t border-slate-100 py-10">
        <div className="max-w-[1200px] lg:max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
           <NewsSection />
        </div>
      </div>

    </div>
  );
}

export default HomePage;