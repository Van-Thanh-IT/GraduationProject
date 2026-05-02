// File: src/pages/WarrantyPage.jsx
import React, { useState } from 'react';
import { Input, Button, Spin } from 'antd';
import { 
  Search, ShieldCheck, ShieldAlert, Smartphone, 
  User, Calendar, Hash, FileText 
} from 'lucide-react';
import dayjs from 'dayjs';
import { useWarrantyLookup } from '@/hooks/useHome'; // Đảm bảo đường dẫn hook của bạn đúng


const WarrantyPage = () => {
  const [keyword, setKeyword] = useState('');
  
  // Bóc tách thêm isError và error từ hook để bắt lỗi 400 của Backend
  const { mutate: searchWarranty, data: results, isLoading, isSuccess, isError, error } = useWarrantyLookup();

  const handleSearch = () => {
    if (!keyword.trim()) return;
    searchWarranty(keyword.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  // Hàm tính toán % thời gian bảo hành
  const calculateProgress = (start, end) => {
    const startDate = dayjs(start);
    const endDate = dayjs(end);
    const now = dayjs();
    
    if (now.isBefore(startDate)) return 0;
    if (now.isAfter(endDate)) return 100;

    const totalDays = endDate.diff(startDate, 'day');
    const passedDays = now.diff(startDate, 'day');
    
    if (totalDays <= 0) return 100;
    return Math.round((passedDays / totalDays) * 100);
  };

  // Lấy lời nhắn lỗi từ Backend (Nằm trong error.response.data.messages nếu dùng Axios)
  const errorMessage = error?.response?.data?.messages || "Đã có lỗi xảy ra trong quá trình tra cứu. Vui lòng thử lại.";

  return (
    <div className="bg-[#f8fafc] min-h-[calc(100vh-64px)] font-sans pb-20">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative bg-[#0B1120] pt-20 pb-32 overflow-hidden">
        <div className="absolute top-[-50%] left-[-10%] w-[60%] h-[100%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[80%] bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-6 border border-blue-400/30">
            <ShieldCheck size={32} className="text-cyan-400" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
            Tra cứu thông tin bảo hành
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Kiểm tra thời hạn bảo hành chính hãng cho các sản phẩm công nghệ của bạn nhanh chóng và chính xác.
          </p>
        </div>
      </section>

      {/* ================= SEARCH BOX ================= */}
      <section className="relative z-20 -mt-12 max-w-3xl mx-auto px-4">
        <div className="bg-white p-3 md:p-4 rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 flex flex-col md:flex-row gap-3 items-center">
          
          <div className="flex-1 w-full">
            <Input 
              size="large"
              prefix={<Search size={20} className="text-gray-400 mr-2" />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập IMEI, Mã đơn hàng hoặc Số điện thoại..." 
              className="w-full h-14 rounded-xl text-base md:text-lg bg-gray-50 hover:bg-white focus:bg-white border-gray-200 shadow-none transition-all"
            />
          </div>

          <Button 
            type="primary" 
            size="large" 
            className="w-full md:w-auto h-14 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-base shadow-md shadow-blue-200"
            onClick={handleSearch}
            loading={isLoading}
          >
            Tra cứu ngay
          </Button>

        </div>
      </section>

      {/* ================= RESULTS SECTION ================= */}
      <section className="max-w-4xl mx-auto px-4 mt-12">
        
        {/* STATE 1: ĐANG TÌM KIẾM */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
            <Spin size="large" />
            <p className="text-gray-500 font-medium">Đang tìm kiếm dữ liệu...</p>
          </div>
        )}

        {/* STATE 2: LỖI TỪ BACKEND (Mã 400) */}
        {isError && !isLoading && (
          <div className="bg-white rounded-3xl border border-rose-100 p-12 flex flex-col items-center justify-center text-center shadow-sm animate-fade-in-up">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-5">
              <ShieldAlert size={36} className="text-rose-500" />
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-3 tracking-tight">Tra cứu không thành công</h3>
            <p className="text-rose-600 font-medium bg-rose-50 px-4 py-2 rounded-lg border border-rose-100">
              {errorMessage}
            </p>
          </div>
        )}

        {/* STATE 3: THÀNH CÔNG NHƯNG RỖNG (Phòng hờ backend trả về 200 nhưng mảng trống) */}
        {isSuccess && (!results || results.length === 0) && !isLoading && (
          <div className="bg-white rounded-3xl border border-gray-100 p-16 flex flex-col items-center justify-center text-center shadow-sm animate-fade-in-up">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Search size={32} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy thông tin</h3>
            <p className="text-gray-500">
              Rất tiếc, chúng tôi không tìm thấy sản phẩm nào khớp với thông tin "{keyword}". <br/> Vui lòng kiểm tra lại IMEI hoặc Số điện thoại.
            </p>
          </div>
        )}

        {/* STATE 4: THÀNH CÔNG CÓ KẾT QUẢ */}
        {isSuccess && results?.length > 0 && !isLoading && (
          <div className="flex flex-col gap-6 animate-fade-in-up">
            <h3 className="text-lg font-bold text-gray-700 mb-2">
              Tìm thấy <span className="text-blue-600">{results.length}</span> kết quả
            </h3>
            
            {results.map((item, index) => {
              const isValid = item.status.includes('HỢP LỆ') || item.status.includes('CÒN');
              const progress = calculateProgress(item.purchaseDate, item.expireDate);
              
              return (
                <div key={index} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  
                  {/* Card Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-white border border-gray-100 rounded-2xl overflow-hidden p-2 shrink-0">
                        <img src={item.thumbnail} alt={item.productName} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h2 className="text-lg md:text-xl font-black text-gray-800 line-clamp-2 leading-tight">
                          {item.productName}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-md text-xs font-bold text-gray-600 tracking-wider">
                            <Hash size={14} /> {item.imei}
                          </span>
                          <span className="flex items-center gap-1 text-sm font-medium text-gray-500">
                            <FileText size={16} className="text-gray-400" /> Đơn: {item.orderCode}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm shrink-0 w-fit ${
                      isValid ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}>
                      {isValid ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                      {item.status}
                    </div>
                  </div>

                  {/* Card Body - Grid Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Cột 1: Khách hàng */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Khách hàng</p>
                          <p className="text-base font-semibold text-gray-800">{item.customerName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                          <Smartphone size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Số điện thoại</p>
                          {/* Che bớt số điện thoại cho bảo mật */}
                          <p className="text-base font-semibold text-gray-800">
                            {item.phone?.replace(/(\d{3})\d{4}(\d{3})/, "$1****$2") || 'Không có'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Cột 2: Thời gian */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ngày mua hàng</p>
                          <p className="text-base font-semibold text-gray-800">
                            {dayjs(item.purchaseDate).format('DD/MM/YYYY')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ngày hết hạn</p>
                          <p className="text-base font-semibold text-rose-600">
                            {dayjs(item.expireDate).format('DD/MM/YYYY')} 
                            <span className="text-gray-500 text-sm ml-1">({item.warrantyText})</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tiền trình bảo hành (Timeline Progress) */}
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                     <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                       <span>Bắt đầu bảo hành</span>
                       <span>Kết thúc</span>
                     </div>
                     <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                       <div 
                         className={`h-full rounded-full transition-all duration-1000 ease-out ${isValid ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-rose-500'}`}
                         style={{ width: `${progress}%` }}
                       ></div>
                     </div>
                     <p className="text-center text-sm font-medium text-gray-600 mt-3">
                       {isValid 
                          ? `Đã trôi qua ${progress}% thời gian bảo hành` 
                          : 'Sản phẩm đã hết hạn bảo hành'}
                     </p>
                  </div>

                </div>
              );
            })}
          </div>
        )}
       

      </section>
    </div>
  );
}

export default WarrantyPage;