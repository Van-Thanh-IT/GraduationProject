// File: src/modules/client/products/ProductPage.jsx
import React, { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Pagination, Spin, Empty, Select, Breadcrumb } from 'antd';
import { HomeOutlined, CloseCircleFilled, ThunderboltFilled } from '@ant-design/icons'; // Thêm icon sấm sét
import { useGetHomeProducts } from '@/hooks/useProducts'; 
import ProductCard from './components/ProductCard';
import AdvancedFilterSidebar from './components/AdvancedFilterSidebar';

export default function ProductPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // 1. LẤY TOÀN BỘ PARAMS TỪ URL (Thêm isFlashSale)
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  
  const sortBy = searchParams.get('sortBy') || 'newest';
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 20;
  
  // Lấy params isFlashSale (chuyển string 'true' thành boolean)
  const isFlashSale = searchParams.get('isFlashSale') === 'true';

  // 2. ĐÓNG GÓI PARAMS CHUẨN XÁC CHO BACKEND
  const queryParams = useMemo(() => ({
    ...(keyword && { keyword }),
    ...(category && { category }),
    ...(brand && { brand }),
    ...(minPrice && { minPrice }),
    ...(maxPrice && { maxPrice }),
    ...(isFlashSale && { isFlashSale: true }), 
    sortBy,
    page,
    limit,
  }), [keyword, category, brand, minPrice, maxPrice, isFlashSale, sortBy, page, limit]);

  const { data, isLoading, isFetching } = useGetHomeProducts(queryParams);

  const products = data?.items || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 1;

  // 3. CÁC HÀM XỬ LÝ SỰ KIỆN
  const handleSortChange = (newSortBy) => {
    searchParams.set('sortBy', newSortBy);
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  const handlePageChange = (newPage) => {
    searchParams.set('page', newPage.toString());
    setSearchParams(searchParams);
    window.scrollTo({ top: 80, behavior: 'smooth' }); 
  };

  const clearFilter = (type) => {
    searchParams.delete(type);
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  const clearAllFilters = () => {
    searchParams.delete('keyword');
    searchParams.delete('category');
    searchParams.delete('brand');
    searchParams.delete('minPrice');
    searchParams.delete('maxPrice');
    searchParams.delete('isFlashSale'); 
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  // Hàm chuyển đổi bật/tắt Flash Sale nhanh
  const toggleFlashSale = () => {
    if (isFlashSale) {
      searchParams.delete('isFlashSale');
    } else {
      searchParams.set('isFlashSale', 'true');
    }
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  const renderPriceLabel = () => {
    if (minPrice && maxPrice) return `Từ ${Number(minPrice).toLocaleString('vi')}đ - ${Number(maxPrice).toLocaleString('vi')}đ`;
    if (minPrice) return `Từ ${Number(minPrice).toLocaleString('vi')}đ trở lên`;
    if (maxPrice) return `Dưới ${Number(maxPrice).toLocaleString('vi')}đ`;
    return null;
  };

  // KIỂM TRA CÓ ĐANG DÙNG LỌC HAY KHÔNG
  const isFiltering = keyword || category || brand || minPrice || maxPrice || isFlashSale;

  return (
    <div className="min-h-screen bg-[#f5f5fa] pb-12 pt-4 font-sans">
      <div className="max-w-[1200px] lg:max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
        
        {/* BREADCRUMB */}
        <div className="mb-4">
          <Breadcrumb
            items={[
              { title: <span className="cursor-pointer flex items-center gap-1 hover:text-indigo-600" onClick={() => navigate('/')}><HomeOutlined /> Trang chủ</span> },
              { title: 'Tất cả sản phẩm' },
              ...(category ? [{ title: <span className="capitalize text-indigo-600">{category.replace(/-/g, ' ')}</span> }] : [])
            ]}
            className="text-[13px] font-medium"
          />
        </div>

        {/* ================= CHIP THÔNG BÁO LỌC (ACTIVE FILTERS) ================= */}
        {isFiltering && (
          <div className="mb-5 flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
            <span className="text-slate-500 text-[13px] font-medium mr-2">Đang lọc theo:</span>
            
            {keyword && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
                <span className="text-[13px] font-bold text-indigo-700">Từ khóa: "{keyword}"</span>
                <CloseCircleFilled className="text-indigo-300 hover:text-indigo-600 cursor-pointer" onClick={() => clearFilter('keyword')} />
              </div>
            )}
            
            {category && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                <span className="text-[13px] font-bold text-emerald-700 capitalize">Danh mục: {category.replace(/-/g, ' ')}</span>
                <CloseCircleFilled className="text-emerald-300 hover:text-emerald-600 cursor-pointer" onClick={() => clearFilter('category')} />
              </div>
            )}

            {brand && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full">
                <span className="text-[13px] font-bold text-blue-700 capitalize">Hãng: {brand.replace(/-/g, ' ')}</span>
                <CloseCircleFilled className="text-blue-300 hover:text-blue-600 cursor-pointer" onClick={() => clearFilter('brand')} />
              </div>
            )}

            {(minPrice || maxPrice) && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full">
                <span className="text-[13px] font-bold text-amber-700">{renderPriceLabel()}</span>
                <CloseCircleFilled className="text-amber-300 hover:text-amber-600 cursor-pointer" onClick={() => { clearFilter('minPrice'); clearFilter('maxPrice'); }} />
              </div>
            )}

            {/* CHIP BÁO ĐANG LỌC FLASH SALE */}
            {isFlashSale && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-100 rounded-full">
                <span className="text-[13px] font-bold text-rose-600 flex items-center gap-1"><ThunderboltFilled className="text-rose-500"/> Flash Sale</span>
                <CloseCircleFilled className="text-rose-300 hover:text-rose-600 cursor-pointer" onClick={() => clearFilter('isFlashSale')} />
              </div>
            )}

            {/* Nút Xóa tất cả */}
            <button 
              onClick={clearAllFilters}
              className="ml-auto text-[13px] font-bold text-rose-500 hover:text-rose-600 hover:underline"
            >
              Xóa tất cả
            </button>
          </div>
        )}

        {/* ================= LAYOUT 2 CỘT ================= */}
        <div className="flex flex-col md:flex-row gap-5 lg:gap-6 items-start">
          
          {/* CỘT TRÁI: SIDEBAR BỘ LỌC ĐA NĂNG */}
          <div className="w-full md:w-[250px] shrink-0 hidden md:block sticky top-24">
            <AdvancedFilterSidebar />
          </div>

          {/* CỘT PHẢI: NỘI DUNG CHÍNH */}
          <div className="flex-1 min-w-0 w-full flex flex-col gap-4">
            
            {/* THANH SẮP XẾP */}
            <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium text-[13px] hidden sm:block">Sắp xếp:</span>
                <div className="flex gap-2 flex-wrap">
                  {['newest', 'best_selling'].map((sortType) => (
                    <button 
                      key={sortType}
                      onClick={() => handleSortChange(sortType)}
                      className={`px-4 py-1.5 rounded-[8px] text-[13px] font-bold transition-all ${
                        sortBy === sortType 
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 ring-2 ring-indigo-600/20 ring-offset-1' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {sortType === 'newest' ? 'Mới nhất' : 'Bán chạy'}
                    </button>
                  ))}

                  {/* NÚT TOGGLE FLASH SALE (NỔI BẬT) */}
                  <button 
                    onClick={toggleFlashSale}
                    className={`px-4 py-1.5 rounded-[8px] text-[13px] font-bold transition-all flex items-center gap-1.5 border ${
                      isFlashSale 
                        ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm ring-2 ring-rose-500/20 ring-offset-1' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <ThunderboltFilled className={isFlashSale ? "text-rose-500" : "text-slate-400"} /> 
                    Flash Sale
                  </button>
                  
                  {/* Select Giá có icon */}
                  <Select
                    value={sortBy.includes('price') ? sortBy : 'price_default'}
                    onChange={handleSortChange}
                    className="w-[170px] custom-sort-select"
                    options={[
                      { value: 'price_default', label: 'Giá (Cao - Thấp)', disabled: true },
                      { value: 'price_asc', label: 'Giá: Thấp đến Cao' },
                      { value: 'price_desc', label: 'Giá: Cao đến Thấp' },
                    ]}
                  />
                </div>
              </div>

              {/* Phân trang mini */}
              <div className="hidden lg:flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-indigo-600 font-black text-sm">{page}</span>
                  <span className="text-slate-400 text-xs">/</span>
                  <span className="text-slate-600 font-bold text-sm">{totalPages}</span>
                </div>
              </div>
            </div>

            {/* LƯỚI SẢN PHẨM */}
            <div className="relative min-h-[500px]">
              {/* Overlay mờ khi isFetching */}
              {isFetching && !isLoading && (
                <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[2px] rounded-2xl transition-all duration-300"></div>
              )}

              {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 rounded-2xl">
                  <Spin size="large" />
                  <p className="mt-3 text-slate-500 font-medium text-sm">Đang tải sản phẩm...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white py-24 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                  <Empty 
                    description={<span className="text-slate-500 font-medium text-[15px]">Rất tiếc, không có sản phẩm nào khớp với bộ lọc!</span>} 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                  {isFiltering && (
                    <button 
                      onClick={clearAllFilters}
                      className="mt-5 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
                    >
                      Bỏ qua bộ lọc và xem tất cả
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>

            {/* THANH PHÂN TRANG (PAGINATION) DƯỚI CÙNG */}
            {totalElements > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-200/60 flex justify-center">
                <Pagination
                  current={page}
                  pageSize={limit}
                  total={totalElements}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  className="custom-shopee-pagination"
                />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}