import React from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { 
  FilterOutlined, 
  AppstoreOutlined, 
  RightOutlined 
} from '@ant-design/icons';
import { useGetHomeData } from '@/hooks/useHome'; // Hoặc hook gọi API Categories của bạn

export default function CategorySidebar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation(); // Hook này giúp ta biết mình đang đứng ở trang nào
  
  const { data, isLoading } = useGetHomeData();
  
  // 1. Lấy danh mục đang được chọn trên URL
  const currentCategory = searchParams.get('category') || '';
  const { categories = [] } = data || {};

  // 2. Logic "Thông Minh" xử lý click
  const handleSelectCategory = (slug) => {
    // Nếu khách hàng chưa ở trang /products, thì BẮT BUỘC PHẢI CHUYỂN TRANG
    if (!location.pathname.includes('/products')) {
       // Điều hướng sang trang /products kèm theo slug danh mục
       // Nếu slug rỗng (bấm "Tất cả sản phẩm"), nó sẽ ra `/products`
       navigate(`/products${slug ? `?category=${slug}` : ''}`);
       return; 
    }

    // NẾU ĐÃ Ở TRANG /products RỒI -> Chỉ cần cập nhật Query Params tại chỗ
    if (currentCategory === slug) {
      searchParams.delete('category'); // Bấm lại lần nữa thì bỏ chọn
    } else {
      if (slug) {
        searchParams.set('category', slug);
      } else {
        searchParams.delete('category'); // Bấm "Tất cả sản phẩm" -> Xóa biến category
      }
    }
    
    // Luôn reset về trang 1 khi đổi bộ lọc
    searchParams.set('page', '1'); 
    setSearchParams(searchParams);
  };

  if (isLoading) {
    return (
      <div className="w-full h-[200px] flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-100">
        <Spin />
        <span className="text-slate-500 font-medium mt-3 text-sm">Đang tải bộ lọc...</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      
      {/* HEADER CỦA SIDEBAR */}
      <div className="bg-indigo-600 px-5 py-3.5">
        <h3 className="font-black text-white text-[15px] flex items-center gap-2 m-0 uppercase tracking-wide">
          <FilterOutlined /> BỘ LỌC TÌM KIẾM
        </h3>
      </div>

      <div className="p-4 md:p-5">
        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-[14px] uppercase tracking-wider">
          <AppstoreOutlined className="text-indigo-500" /> Theo Danh Mục
        </h4>
        
        <ul className="space-y-1.5">
          {/* ================= NÚT TẤT CẢ SẢN PHẨM ================= */}
          <li>
            <div 
              onClick={() => handleSelectCategory('')} // Truyền chuỗi rỗng
              className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all ${!currentCategory ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${!currentCategory ? 'bg-indigo-600' : 'bg-transparent'}`}></div>
              Tất cả sản phẩm
            </div>
          </li>

          {/* ================= RENDER CÂY DANH MỤC ================= */}
          {categories.map((parent) => {
            const isParentActive = currentCategory === parent.slug;
            const hasChildren = parent.children && parent.children.length > 0;
            // Kích hoạt thẻ cha nếu đang chọn thẻ con
            const isChildActive = hasChildren && parent.children.some(c => c.slug === currentCategory);
            const isExpanded = isParentActive || isChildActive; 

            return (
              <li key={parent.id} className="pt-2">
                
                {/* THẺ CHA */}
                <div 
                  onClick={() => handleSelectCategory(parent.slug)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all ${isParentActive || isExpanded ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' : 'text-slate-700 hover:bg-slate-50 font-semibold'}`}
                >
                   {parent.imageUrl && <img src={parent.imageUrl} alt="" className="w-6 h-6 object-contain bg-white rounded-md border border-slate-100 p-0.5" />}
                   <span className="flex-1 text-[14px]">{parent.name}</span>
                </div>

                {/* THẺ CON (Hiển thị thụt lề bên dưới thẻ cha) */}
                {hasChildren && (
                  <ul className="pl-8 pr-2 mt-1 space-y-1 border-l-2 border-slate-100 ml-6">
                    {parent.children.map(child => (
                      <li key={child.id}>
                        <div 
                          onClick={() => handleSelectCategory(child.slug)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] cursor-pointer transition-all ${currentCategory === child.slug ? 'text-indigo-700 font-bold bg-indigo-50/50' : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'}`}
                        >
                           <span>{child.name}</span>
                           {currentCategory === child.slug && <RightOutlined className="text-[10px]" />}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}