import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ArrowLeft, MonitorSmartphone, CheckCircle2 } from 'lucide-react';

const AuthLayout = () => {
  return (
    // Container chính tràn viền 100vh và 100vw
    <div className="flex min-h-screen w-full bg-white font-sans">

     {/* ======================================================== */}
      {/* NỬA BÊN PHẢI: KHU VỰC BANNER TRANG TRÍ (Chỉ hiện trên Desktop) */}
      {/* ======================================================== */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] relative bg-[#0B1120] overflow-hidden flex-col justify-between p-12 lg:p-20">
        
        {/* === Các hiệu ứng Background Ánh sáng === */}
        {/* Ánh sáng xanh dương góc trên */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/30 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
        {/* Ánh sáng xanh lá/cyan góc dưới */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-500/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
        {/* Grid Pattern Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNykiLz48L3N2Zz4=')] opacity-50"></div>

        {/* === Header của Banner === */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 w-fit">
              <MonitorSmartphone className="w-8 h-8 text-cyan-400" />
              <span className="text-2xl font-black tracking-tight text-white">
                  Tech<span className="text-cyan-400">Store</span>
              </span>
          </Link>
        </div>

        {/* === Nội dung chính của Banner === */}
        <div className="relative z-10 my-auto">
          <div className="inline-block px-4 py-1.5 rounded-full border border-slate-700 bg-slate-800/50 backdrop-blur-md mb-6">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Premium Quality</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
            Nâng tầm <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              trải nghiệm số
            </span>
          </h2>
          
          <p className="text-slate-400 text-lg max-w-md leading-relaxed mb-10">
            Hệ sinh thái công nghệ hàng đầu. Đăng nhập để nhận ngay ưu đãi độc quyền dành riêng cho thành viên.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-300 font-medium">
              <CheckCircle2 className="text-cyan-400 w-5 h-5" />
              <span>Giao hàng hỏa tốc trong 2 giờ</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 font-medium">
              <CheckCircle2 className="text-cyan-400 w-5 h-5" />
              <span>Đổi trả miễn phí trong 30 ngày</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 font-medium">
              <CheckCircle2 className="text-cyan-400 w-5 h-5" />
              <span>Trả góp 0% qua thẻ tín dụng</span>
            </div>
          </div>
        </div>

        {/* === Footer của Banner === */}
        <div className="relative z-10 flex items-center gap-4 text-sm text-slate-500 font-medium">
          <span>© 2026 TechStore</span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
          <a href="#" className="hover:text-cyan-400 transition-colors">Bảo mật</a>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
          <a href="#" className="hover:text-cyan-400 transition-colors">Điều khoản</a>
        </div>

      </div>
      
      {/* ======================================================== */}
      {/* NỬA BÊN TRÁI: KHU VỰC FORM (Chiếm full mobile, 50% desktop) */}
      {/* ======================================================== */}
      <div className="w-full md:w-1/2 lg:w-[45%] flex flex-col relative">
        
        {/* Nút quay lại trang chủ */}
        <div className="absolute top-6 left-6 md:top-8 md:left-10 z-20">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-all group"
          >
            <div className="p-2 rounded-full bg-gray-50 group-hover:bg-blue-50 border border-transparent group-hover:border-blue-100 transition-colors">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            </div>
            Về trang chủ
          </Link>
        </div>

        {/* Khung bọc Outlet (Nơi hiển thị Form Login/Register) */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 py-20">
          <div className="w-full max-w-[400px]">
            
            {/* Logo xuất hiện trên Mobile (Vì mobile bị ẩn nửa bên phải) */}
            <div className="md:hidden flex items-center gap-2 mb-8 justify-center">
                <MonitorSmartphone className="w-8 h-8 text-blue-600" />
                <span className="text-3xl font-black tracking-tight text-gray-900">
                    Tech<span className="text-blue-600">Store</span>
                </span>
            </div>
            <Outlet />
          
          </div>
        </div>
      </div>

    </div>
  );
};

export default AuthLayout;