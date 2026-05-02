// import React from 'react';
// import { Zap, ChevronRight, Flame } from 'lucide-react';
// import { mockFlashSaleProducts } from '@/data/mockFlashSaleProducts';
// import CountdownTimer from './CountdownTimer';

// const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// export default function FlashSaleSection() {
//   return (
//     // Nền của khối Flash Sale thường có màu nổi bật (Đỏ/Cam nhạt)
//     <div className="bg-gradient-to-b from-rose-50 to-white p-6 rounded-2xl shadow-sm border border-rose-100 mb-8">
      
//       {/* HEADER: Tiêu đề + Nhấp nháy */}
//       <div className="flex justify-between items-center mb-6">
//         <div className="flex items-center gap-2">
//           {/* Sấm sét nhấp nháy liên tục (animate-pulse) */}
//           <div className="bg-rose-600 p-1.5 rounded-full animate-pulse shadow-lg shadow-rose-500/50">
//             <Zap fill="currentColor" size={24} className="text-yellow-300" />
//           </div>
//           <h2 className="text-2xl font-black italic text-rose-600 uppercase tracking-tight">
//             Flash Sale
//           </h2>
//         </div>
        
//         <button className="text-sm font-semibold text-rose-600 hover:text-rose-700 flex items-center transition-colors">
//           Xem tất cả <ChevronRight size={16} />
//         </button>
//       </div>

//       {/* DANH SÁCH SẢN PHẨM: Dùng flex lướt ngang (Scroll snap) cho chuẩn mobile */}
//       <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
//         {mockFlashSaleProducts.map((product) => {
//           // Tính toán phần trăm thanh tiến trình
//           const percentSold = Math.min(Math.round((product.sold / product.total) * 100), 100);
//           const isSoldOut = percentSold === 100;
//           const isSellingFast = percentSold >= 80 && !isSoldOut; // Trên 80% là "Sắp cháy hàng"

//           return (
//             <div 
//               key={product.variantId} 
//               className="snap-start flex-shrink-0 w-[180px] sm:w-[200px] bg-white rounded-xl border border-gray-100 p-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative group"
//             >
//               {/* Ảnh và Badge giảm giá */}
//               <div className="relative aspect-square mb-3 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
//                 <img 
//                   src={product.image} 
//                   alt={product.name} 
//                   className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isSoldOut ? 'opacity-40 grayscale' : ''}`}
//                 />
                
//                 {/* Badge giảm giá Đỏ rực chớp góc */}
//                 <div className="absolute top-0 right-0 bg-rose-500 text-white text-[11px] font-bold px-2 py-1 rounded-bl-lg shadow-md z-10">
//                   -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
//                 </div>

//                 {isSoldOut && (
//                   <div className="absolute inset-0 flex items-center justify-center z-20">
//                     <div className="bg-gray-800/80 text-white text-xs font-bold px-3 py-1.5 rounded uppercase backdrop-blur-sm">
//                       Đã bán hết
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Tên sản phẩm */}
//               <h3 className="text-xs text-gray-700 font-medium line-clamp-2 min-h-[32px] mb-2 leading-relaxed">
//                 {product.name}
//               </h3>

//               {/* Giá tiền */}
//               <div className="flex flex-col mb-3">
//                 <span className="text-gray-400 text-[11px] line-through">
//                   {formatCurrency(product.originalPrice)}
//                 </span>
//                 <span className="text-rose-600 font-bold text-base">
//                   {formatCurrency(product.price)}
//                 </span>
//               </div>

//               {/* === THANH TIẾN TRÌNH (PROGRESS BAR) CHUẨN SHOPEE === */}
//               <div className="relative w-full h-[18px] bg-rose-100 rounded-full overflow-hidden flex items-center justify-center border border-rose-200 shadow-inner">
                
//                 {/* Phần trăm màu đỏ chạy theo số lượng */}
//                 <div 
//                   className={`absolute top-0 left-0 h-full transition-all duration-1000 ${isSoldOut ? 'bg-gray-400' : 'bg-gradient-to-r from-orange-500 to-rose-600'}`}
//                   style={{ width: `${percentSold}%` }}
//                 ></div>

//                 {/* Hiệu ứng tia chớp/lửa bên trong thanh nếu bán cực chạy */}
//                 {isSellingFast && (
//                   <div className="absolute left-1 top-1/2 -translate-y-1/2 animate-bounce">
//                     <Flame size={14} fill="white" className="text-yellow-200" />
//                   </div>
//                 )}

//                 {/* Chữ hiển thị số lượng */}
//                 <span className="relative z-10 text-[10px] font-bold text-white drop-shadow-md">
//                   {isSoldOut ? 'HẾT HÀNG' : (isSellingFast ? 'SẮP CHÁY HÀNG' : `ĐÃ BÁN ${product.sold}`)}
//                 </span>
//               </div>

//               {/* === ĐỒNG HỒ ĐẾM NGƯỢC CHO TỪNG SẢN PHẨM === */}
//               {!isSoldOut && (
//                 <CountdownTimer endTime={product.endTime} />
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }