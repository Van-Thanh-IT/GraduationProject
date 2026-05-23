import React, { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Pagination, Spin, Empty, Select, Breadcrumb } from 'antd';
import { HomeOutlined, CloseCircleFilled, ThunderboltFilled } from '@ant-design/icons';
import { useGetHomeProducts } from '@/hooks/useProducts'; 
import ProductCard from './components/ProductCard';
import AdvancedFilterSidebar from './components/AdvancedFilterSidebar';

export default function ProductPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sortBy = searchParams.get('sortBy') || 'newest';
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 20;
  const isFlashSale = searchParams.get('isFlashSale') === 'true';

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

  const isFiltering = keyword || category || brand || minPrice || maxPrice || isFlashSale;

  return (
    <div className="min-h-screen bg-gray-50 pb-8 pt-3 font-sans">
      <div className="max-w-[1200px] lg:max-w-[1400px] mx-auto px-4 md:px-6">
        
        <div className="mb-2">
          <Breadcrumb
            items={[
              { title: <span className="cursor-pointer flex items-center gap-1 hover:text-blue-600" onClick={() => navigate('/')}><HomeOutlined /> Trang chủ</span> },
              { title: 'Tất cả sản phẩm' },
              ...(category ? [{ title: <span className="capitalize text-blue-600">{category.replace(/-/g, ' ')}</span> }] : [])
            ]}
            className="text-[13px] font-medium"
          />
        </div>

        {isFiltering && (
          <div className="mb-2 flex flex-wrap items-center gap-2 bg-white px-4 py-2.5 rounded-lg border border-gray-100 shadow-sm">
            <span className="text-gray-500 text-[13px] font-medium mr-1">Đang lọc theo:</span>
            
            {keyword && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full">
                <span className="text-[12px] font-semibold text-blue-700">Từ khóa: "{keyword}"</span>
                <CloseCircleFilled className="text-blue-300 hover:text-blue-500 cursor-pointer text-[13px]" onClick={() => clearFilter('keyword')} />
              </div>
            )}
            
            {category && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full">
                <span className="text-[12px] font-semibold text-gray-700 capitalize">Danh mục: {category.replace(/-/g, ' ')}</span>
                <CloseCircleFilled className="text-gray-300 hover:text-gray-500 cursor-pointer text-[13px]" onClick={() => clearFilter('category')} />
              </div>
            )}

            {brand && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full">
                <span className="text-[12px] font-semibold text-gray-700 capitalize">Hãng: {brand.replace(/-/g, ' ')}</span>
                <CloseCircleFilled className="text-gray-300 hover:text-gray-500 cursor-pointer text-[13px]" onClick={() => clearFilter('brand')} />
              </div>
            )}

            {(minPrice || maxPrice) && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full">
                <span className="text-[12px] font-semibold text-gray-700">{renderPriceLabel()}</span>
                <CloseCircleFilled className="text-gray-300 hover:text-gray-500 cursor-pointer text-[13px]" onClick={() => { clearFilter('minPrice'); clearFilter('maxPrice'); }} />
              </div>
            )}

            {isFlashSale && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-100 rounded-full">
                <span className="text-[12px] font-semibold text-red-600 flex items-center gap-1">⚡ Flash Sale</span>
                <CloseCircleFilled className="text-red-300 hover:text-red-500 cursor-pointer text-[13px]" onClick={() => clearFilter('isFlashSale')} />
              </div>
            )}

            <button 
              onClick={clearAllFilters}
              className="ml-auto text-[13px] font-semibold text-red-500 hover:text-red-600"
            >
              Xóa tất cả
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-5 items-start">
          
          <div 
            className="hidden md:block w-[240px] lg:w-[260px] shrink-0 sticky h-max z-30"
            style={{ top: "calc(var(--header-height) + 12px)" }}
          >
            <AdvancedFilterSidebar />
          </div>

          <div className="flex-1 min-w-0 w-full flex flex-col gap-3.5">
            
            <div className="bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-medium text-[13px] hidden sm:block">Sắp xếp:</span>
                <div className="flex gap-2 flex-wrap">
                  {['newest', 'best_seller'].map((sortType) => (
                    <button 
                      key={sortType}
                      onClick={() => handleSortChange(sortType)}
                      className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${
                        sortBy === sortType 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {sortType === 'newest' ? 'Mới nhất' : 'Bán chạy'}
                    </button>
                  ))}

                  <button 
                    onClick={toggleFlashSale}
                    className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-1 border ${
                      isFlashSale 
                        ? 'bg-red-50 text-red-600 border-red-200 shadow-sm' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <ThunderboltFilled className={isFlashSale ? "text-red-500" : "text-gray-400"} /> 
                    Flash Sale
                  </button>
                  
                  <Select
                    value={sortBy.includes('price') ? sortBy : 'price_default'}
                    onChange={handleSortChange}
                    className="w-[160px] custom-sort-select"
                    options={[
                      { value: 'price_default', label: 'Giá (Cao - Thấp)', disabled: true },
                      { value: 'price_asc', label: 'Giá: Thấp đến Cao' },
                      { value: 'price_desc', label: 'Giá: Cao đến Thấp' },
                    ]}
                  />
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-1.5">
                <span className="text-blue-600 font-bold text-sm">{page}</span>
                <span className="text-gray-300 text-xs">/</span>
                <span className="text-gray-500 font-medium text-sm">{totalPages}</span>
              </div>
            </div>

            <div className="relative min-h-[400px]">
              {isFetching && !isLoading && (
                <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[1px] rounded-xl transition-all"></div>
              )}

              {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 rounded-xl">
                  <Spin />
                  <p className="mt-2 text-gray-400 text-xs font-medium">Đang tải sản phẩm...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white py-16 rounded-xl border border-gray-100 flex flex-col items-center justify-center">
                  <Empty 
                    description={<span className="text-gray-400 text-[14px]">Rất tiếc, không có sản phẩm nào khớp với bộ lọc!</span>} 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                  {isFiltering && (
                    <button 
                      onClick={clearAllFilters}
                      className="mt-4 px-5 py-2 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Bỏ qua bộ lọc và xem tất cả
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 md:gap-3.5">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>

            {totalElements > 0 && (
              <div className="mt-5 pt-5 border-t border-gray-200 flex justify-center">
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