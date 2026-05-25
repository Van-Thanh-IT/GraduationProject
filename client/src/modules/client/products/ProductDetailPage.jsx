// File: src/modules/client/products/detail/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { Breadcrumb, Spin } from 'antd';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Import thêm Link

import { HomeOutlined, FileTextOutlined, SettingOutlined, FireFilled, RightOutlined } from '@ant-design/icons';
import { useGetProductDetail } from '@/hooks/useProducts'; 
import { useGetProductReviewSummary } from '@/hooks/useReviews'; 
import { useGetHomeData } from '@/hooks/useHome'; // IMPORT HOOK GỢI Ý SẢN PHẨM

import ProductGallery from './components/ProductGallery';
import ProductInfo from './components/ProductInfo';
import ProductReviewSummary from './components/ProductReviewSummary'; 
import ProductCard from './components/ProductCard'; // IMPORT COMPONENT THẺ SẢN PHẨM

export default function ProductDetailPage() {
  const { slug } = useParams(); 
  const navigate = useNavigate();
  
  const { data: product, isLoading } = useGetProductDetail(slug);
  
  // GỌI API LẤY TỔNG QUAN ĐÁNH GIÁ
  const { data: reviewSummary, isLoading: isReviewLoading } = useGetProductReviewSummary(product?.id);
  
  // GỌI API LẤY DỮ LIỆU GỢI Ý (BÁN CHẠY NHẤT) TỪ TRANG CHỦ
  const { data: homeData } = useGetHomeData();
  const bestSellers = homeData?.bestSellers || [];

  const [selectedOptions, setSelectedOptions] = useState({ option1: null, option2: null, option3: null });
  const [currentVariant, setCurrentVariant] = useState(null);

  useEffect(() => {
    if (product?.variants?.length > 0) {
      const defaultVariant = product.variants.find(v => v.isDefault) || product.variants[0];
      setSelectedOptions({
        option1: defaultVariant.option1Value,
        option2: defaultVariant.option2Value,
        option3: defaultVariant.option3Value,
      });
      setCurrentVariant(defaultVariant);
    }
  }, [product]);

  const handleOptionChange = (optionKey, value) => {
    let newOptions = { ...selectedOptions, [optionKey]: value };
    let matchedVariant = product.variants.find(v => 
      v.option1Value === newOptions.option1 &&
      v.option2Value === newOptions.option2 &&
      v.option3Value === newOptions.option3
    );

    if (!matchedVariant) {
      matchedVariant = product.variants.find(v => v[`${optionKey}Value`] === value);
      if (matchedVariant) {
        newOptions = {
          option1: matchedVariant.option1Value,
          option2: matchedVariant.option2Value,
          option3: matchedVariant.option3Value
        };
      }
    }

    setSelectedOptions(newOptions);
    if (matchedVariant) setCurrentVariant(matchedVariant);
  };

  // Cuộn lên đầu trang khi chuyển đổi sản phẩm gợi ý
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5fa]">
        <Spin size="large" />
        <p className="mt-4 text-slate-500 font-medium">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5fa] min-h-screen pb-16 pt-6 font-sans">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        
        {/* Breadcrumb */}
        <div className="mb-2">
          <Breadcrumb
            items={[
              { title: <span className="cursor-pointer hover:text-indigo-600" onClick={()=>navigate('/')}><HomeOutlined /> Trang chủ</span> },
              { title: <span className="cursor-pointer hover:text-indigo-600" onClick={()=>navigate(`/products?category=${product.categorySlug}`)}>{product.categoryName}</span> },
              { title: <span className="font-semibold text-slate-700">{product.name}</span> }
            ]}
          />
        </div>

        {/* ================= KHỐI 1: ẢNH VÀ CHỌN CẤU HÌNH ================= */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-2 md:p-2 lg:p-2 flex flex-col lg:flex-row gap-10 lg:gap-16 mb-4">
          <div className="w-full lg:w-[45%] shrink-0">
             <div className="sticky top-24">
                <ProductGallery images={currentVariant?.images?.length > 0 ? currentVariant.images : [{ id: 0, imageUrl: product.thumbnail, isThumbnail: true }]} />
             </div>
          </div>
          <div className="flex-1 min-w-0">
            <ProductInfo 
              product={product} 
              currentVariant={currentVariant} 
              selectedOptions={selectedOptions}
              onOptionChange={handleOptionChange}
            />
          </div>
        </div>

        {/* ================= KHỐI 2: MÔ TẢ & THÔNG SỐ ================= */}
        <div className="flex flex-col lg:flex-row gap-3 mb-3">
          <div className="flex-1 bg-white rounded-[24px] shadow-sm border border-slate-100 p-4">
            <h2 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-3 uppercase tracking-wide border-b border-slate-100 pb-4">
              <FileTextOutlined className="text-indigo-500" /> Đặc điểm nổi bật
            </h2>

            <div 
              className="prose prose-slate max-w-none leading-relaxed text-[15px] mt-4 
                        [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:mx-auto [&_img]:my-4"
              dangerouslySetInnerHTML={{ __html: product.description || '' }}
            />
          </div>

          <div className="w-full lg:w-[400px] shrink-0">
             <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-4 md:p-4 sticky top-24">
               <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3 uppercase tracking-wide border-b border-slate-100 pb-4">
                  <SettingOutlined className="text-indigo-500" /> Thông số kỹ thuật
               </h2>
               <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-[14.5px]">
                    <tbody>
                      {product.specifications?.map((spec, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                          <td className="py-3 px-4 text-slate-500 font-semibold w-[40%] border-r border-slate-100">{spec.name}</td>
                          <td className="py-3 px-4 text-slate-800 font-medium">{spec.value}</td>
                        </tr>
                      ))}
                      {(!product.specifications || product.specifications.length === 0) && (
                        <tr><td className="py-4 text-center text-slate-400">Đang cập nhật thông số</td></tr>
                      )}
                    </tbody>
                  </table>
               </div>
             </div>
          </div>
        </div>

        {/* ================= KHỐI 3: TỔNG QUAN ĐÁNH GIÁ ================= */}
        <div className="mb-8">
          <ProductReviewSummary 
            productId={product.id} 
            productName={product.name}
            reviewSummary={reviewSummary} 
            isLoading={isReviewLoading} 
          />
        </div>

        {/* ================= KHỐI 4: GỢI Ý SẢN PHẨM (CÓ THỂ BẠN THÍCH) ================= */}
        {bestSellers.length > 0 && (
          <section className="bg-white p-6 md:p-8 rounded-[24px] shadow-sm border border-slate-100 mt-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
              <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 m-0">
                <div className="p-1.5 bg-rose-100 text-rose-500 rounded-lg"><FireFilled /></div>
                CÓ THỂ BẠN THÍCH
              </h2>
              <Link to="/products?sortBy=best_selling" className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:text-indigo-700 transition-colors group">
                Xem tất cả <RightOutlined className="text-[10px] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {bestSellers
                .filter(p => p.id !== product.id) // Ẩn sản phẩm hiện tại khỏi danh sách gợi ý
                .slice(0, 4) // Lấy tối đa 4 sản phẩm để layout đẹp mắt
                .map((p) => (
                <ProductCard key={`suggest-${p.id}`} product={p} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}