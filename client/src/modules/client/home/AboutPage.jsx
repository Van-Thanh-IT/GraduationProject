// File: src/pages/AboutPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Zap, 
  HeartHandshake, 
  Target, 
  Users, 
  Trophy, 
  ShoppingBag,
  ArrowRight
} from 'lucide-react';

const STATS = [
  { label: 'Khách hàng tin dùng', value: '50K+', icon: Users },
  { label: 'Sản phẩm công nghệ', value: '10K+', icon: ShoppingBag },
  { label: 'Năm hình thành & phát triển', value: '5+', icon: Trophy },
  { label: 'Đối tác chiến lược', value: '20+', icon: Target },
];

const VALUES = [
  {
    title: 'Chính hãng 100%',
    description: 'Cam kết mọi sản phẩm đều có nguồn gốc rõ ràng, đầy đủ hóa đơn chứng từ và bảo hành chính hãng.',
    icon: ShieldCheck,
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  {
    title: 'Giao hàng hỏa tốc',
    description: 'Mạng lưới logistics tối ưu giúp sản phẩm đến tay khách hàng trong khu vực nội thành chỉ từ 2 giờ.',
    icon: Zap,
    color: 'text-amber-500',
    bg: 'bg-amber-50'
  },
  {
    title: 'Dịch vụ tận tâm',
    description: 'Đội ngũ tư vấn viên am hiểu công nghệ, sẵn sàng hỗ trợ kỹ thuật 24/7 trong suốt quá trình sử dụng.',
    icon: HeartHandshake,
    color: 'text-rose-500',
    bg: 'bg-rose-50'
  },
  {
    title: 'Giá trị đích thực',
    description: 'Luôn mang đến mức giá cạnh tranh nhất thị trường cùng hàng ngàn chương trình hậu mãi độc quyền.',
    icon: Target,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50'
  }
];

const AboutPage = () => {
  return (
    <div className="bg-white min-h-screen font-sans">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-[#0B1120] pt-24 pb-32">
        {/* Background Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')]"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-sm font-bold uppercase tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            Về Chúng Tôi
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
            Tiên phong nâng tầm <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Trải nghiệm Công nghệ
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed">
            TechStore không chỉ là nơi mua sắm thiết bị điện tử, chúng tôi là điểm đến của những người đam mê công nghệ, nơi hội tụ những sản phẩm tinh hoa và dịch vụ đẳng cấp nhất.
          </p>
        </div>
      </section>

      {/* ================= STATS SECTION ================= */}
      <section className="relative z-20 -mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] border border-gray-100 p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-100">
            {STATS.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className={`flex flex-col items-center text-center ${index !== 0 ? 'pl-8' : ''}`}>
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <Icon size={24} strokeWidth={2} />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">{stat.value}</h3>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= BRAND STORY SECTION ================= */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            {/* Image Placeholder - Bạn thay src bằng ảnh thật của dự án */}
            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100 shadow-xl relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="TechStore Office" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative block */}
            <div className="absolute -bottom-6 -right-6 w-[80%] h-[80%] bg-blue-600 rounded-3xl -z-10 opacity-10"></div>
          </div>
          
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 tracking-tight">Câu chuyện của TechStore</h2>
            <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
              <p>
                Khởi nguồn từ một cửa hàng nhỏ vào năm 2021 với niềm đam mê mãnh liệt dành cho công nghệ, TechStore đã vươn mình trở thành một trong những hệ thống bán lẻ thiết bị số uy tín hàng đầu.
              </p>
              <p>
                Chúng tôi hiểu rằng, trong thời đại số hóa, một thiết bị công nghệ không chỉ là công cụ, mà còn là người bạn đồng hành, là nguồn cảm hứng sáng tạo. Vì vậy, TechStore luôn khắt khe trong việc tuyển chọn sản phẩm từ các thương hiệu danh tiếng nhất như Apple, Samsung, ASUS, Dell...
              </p>
              <p>
                Hành trình của chúng tôi không đo bằng doanh thu, mà đo bằng **sự hài lòng của hàng chục ngàn khách hàng** đã tin tưởng và đồng hành.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CORE VALUES SECTION ================= */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 tracking-tight">Giá trị cốt lõi</h2>
            <p className="text-lg text-gray-500">
              Bốn cột trụ vững chắc định hình nên văn hóa và tiêu chuẩn phục vụ tại TechStore, đảm bảo mang đến trải nghiệm mua sắm hoàn hảo nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((val, index) => {
              const Icon = val.icon;
              return (
                <div key={index} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${val.bg} ${val.color}`}>
                    <Icon size={28} strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{val.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{val.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= CALL TO ACTION (CTA) ================= */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-[3rem] p-12 md:p-16 text-center relative overflow-hidden shadow-2xl">
            {/* Abstract shapes */}
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Sẵn sàng nâng cấp không gian số của bạn?</h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                Hàng ngàn sản phẩm công nghệ đỉnh cao cùng những ưu đãi độc quyền đang chờ đón bạn tại TechStore.
              </p>
              <Link 
                to="/products" // Đổi thành link trang danh sách sản phẩm của bạn
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 hover:scale-105 transition-all shadow-xl shadow-white/10"
              >
                Bắt đầu mua sắm <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default AboutPage;