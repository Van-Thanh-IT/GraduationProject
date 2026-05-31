// File: src/layouts/AuthLayout.jsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ArrowLeft, MonitorSmartphone, CheckCircle2 } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full bg-blue-300 flex items-center justify-center p-4 md:p-8 font-sans">
      
      <div className="w-full max-w-[960px] min-h-[520px] bg-white rounded-2xl border border-gray-200/80 shadow-md flex overflow-hidden">
        
    
        <div className="hidden md:flex md:w-1/2 bg-slate-800/95 flex-col justify-between p-10 relative overflow-hidden">
          
          {/* Đường vát khối phẳng tinh tế đè góc tương tự như mẫu ảnh tham khảo */}
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-white transform translate-x-6 skew-x-6 origin-top hidden lg:block"></div>

          {/* Logo Thương hiệu phía trên sử dụng tone màu hồng cam nhẹ phối cùng chữ trắng */}
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2 w-fit no-underline">
              <MonitorSmartphone className="w-5 h-5 text-rose-400" />
              <span className="text-lg font-bold tracking-tight text-white">
                Tech<span className="text-rose-400">Store</span>
              </span>
            </Link>
          </div>

          {/* Nội dung giới thiệu ở giữa */}
          <div className="relative z-10 my-auto max-w-[280px]">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3.5 tracking-tight leading-tight">
              Chào mừng bạn <br />
              quay trở lại!
            </h2>
            
            <p className="text-gray-400 text-[13px] leading-relaxed mb-6">
              Đăng nhập để quản lý tài khoản cá nhân, theo dõi hành trình đơn hàng và nhận các đặc quyền ưu đãi thành viên.
            </p>

            {/* Khối cam kết phẳng sạch sẽ */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-gray-300 text-[13px]">
                <CheckCircle2 className="text-rose-400 w-4 h-4 shrink-0" />
                <span>Sản phẩm chính hãng 100%</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300 text-[13px]">
                <CheckCircle2 className="text-rose-400 w-4 h-4 shrink-0" />
                <span>Bảo mật giao dịch tuyệt đối</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300 text-[13px]">
                <CheckCircle2 className="text-rose-400 w-4 h-4 shrink-0" />
                <span>Hỗ trợ kỹ thuật chu đáo</span>
              </div>
            </div>
          </div>

          {/* Bản quyền phía dưới chân trang */}
          <div className="relative z-10 text-[11px] text-gray-500 font-medium">
            © {new Date().getFullYear()} TechStore. All rights reserved.
          </div>

        </div>

        <div className="w-full md:w-1/2 flex flex-col relative bg-white">
          
          {/* Nút quay lại trang chủ đặt khít khao ở góc trên bên trái */}
          <div className="absolute top-5 left-5 z-20">
            <Link 
              to="/" 
              className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-rose-500 transition-colors no-underline group"
            >
              <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
              Về trang chủ
            </Link>
          </div>

          {/* Khung căn giữa hoàn toàn biểu mẫu con (Login / Register) */}
          <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-10 py-10">
            <div className="w-full max-w-[320px]">
              
              {/* Logo phụ xuất hiện trên Mobile nhằm đồng bộ nhận diện khi ẩn nửa bên trái */}
              <div className="md:hidden flex items-center gap-1.5 mb-6 justify-center">
                <MonitorSmartphone className="w-5 h-5 text-rose-500" />
                <span className="text-xl font-bold tracking-tight text-gray-900">
                  Tech<span className="text-rose-500">Store</span>
                </span>
              </div>

              {/* Nơi hiển thị các Form con nhập liệu */}
              <Outlet />
            
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AuthLayout;