import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // IMPORT THÊM useNavigate
import { Bot, User, Loader2, ShoppingCart } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const renderFormattedText = (text) => {
  if (!text) return null;
  return text.split('**').map((part, index) => 
    index % 2 === 1 ? <strong key={index} className="font-bold text-gray-900">{part}</strong> : part
  );
};

export default function ChatMessageList({ messages, isLoading, isSending, onActionClick }) {
  const messagesEndRef = useRef(null);
  const navigate = useNavigate(); // KHỞI TẠO NAVIGATE

  // Tự động cuộn xuống dòng mới nhất (Mượt mà / Realtime)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-[#f8fafc] custom-scrollbar flex flex-col gap-5">
      
      {/* Lời chào khi chưa có tin nhắn */}
      {(!messages || messages.length === 0) && !isLoading && (
        <div className="flex gap-3 text-sm mt-2 animate-fade-in">
           <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
             <Bot size={18} className="text-blue-600" />
           </div>
           <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm text-gray-700 max-w-[85%] leading-relaxed">
              Chào bạn! Mình có thể giúp gì cho bạn hôm nay? <br/>
              (Ví dụ: <i>Tư vấn cấu hình, tìm laptop, so sánh giá...</i>)
           </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" /></div>
      ) : (
        messages?.map((msg, index) => {
          const isUser = msg.role === 'USER';
          return (
            <div key={msg.id || index} className={`flex gap-2 text-sm ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
              
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0 shadow-sm">
                  <Bot size={16} className="text-white" />
                </div>
              )}

              <div className={`flex flex-col gap-2 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`p-3.5 shadow-sm whitespace-pre-wrap leading-relaxed text-[14.5px] ${
                    isUser ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none' : 'bg-white border border-gray-200 text-gray-700 rounded-2xl rounded-tl-none'
                  }`}
                >
                  {isUser ? msg.content : renderFormattedText(msg.content)}
                </div>

                {/* Thẻ sản phẩm */}
                {!isUser && msg.attachment && (
                   <div className="bg-white border border-blue-200 p-2.5 rounded-xl shadow-sm w-full max-w-[270px] hover:border-blue-400 hover:shadow-md transition-all cursor-pointer">
                      <div className="flex gap-3">
                        <div className="w-[70px] h-[70px] shrink-0 rounded-lg overflow-hidden border border-gray-100 p-1 bg-white">
                          <img src={msg.attachment.thumbnail} alt={msg.attachment.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col justify-between py-0.5">
                          <h4 className="font-bold text-gray-800 text-[13px] line-clamp-2 leading-snug">{msg.attachment.name}</h4>
                          <div className="mt-1">
                            <span className="font-black text-rose-600 text-[14px]">{formatCurrency(msg.attachment.price)}</span>
                            {msg.attachment.originalPrice > msg.attachment.price && (
                              <span className="text-[11px] text-gray-400 line-through block mt-[-2px]">{formatCurrency(msg.attachment.originalPrice)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Link 
                        to={`/product/${msg.attachment.slug || msg.attachment.id}`} 
                        className="mt-3 w-full flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 py-2 rounded-lg text-[13px] font-bold transition-colors"
                      >
                        <ShoppingCart size={15} /> Xem chi tiết
                      </Link>
                   </div>
                )}

                {/* Nút Gợi ý (Actions) */}
                {!isUser && msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {msg.actions.map((action, idx) => {
                      const buttonLabel = typeof action === 'object' ? action.label : action;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            if (typeof action === 'object' && action.type === 'LINK' && action.url) {
                              // ĐÃ SỬA: Kiểm tra nếu là link ngoài (bắt đầu bằng http) thì mở tab mới
                              // Còn nếu là link nội bộ (/login, /cart...) thì chuyển trang mượt mà
                              if (action.url.startsWith('http')) {
                                window.open(action.url, '_blank');
                              } else {
                                navigate(action.url); // <--- CHUYỂN TRANG NGAY TẠI TAB NÀY
                              }
                            } else {
                              onActionClick(buttonLabel);
                            }
                          }}
                          className="px-3.5 py-1.5 bg-white border border-blue-300 text-blue-600 rounded-full text-[13px] font-medium shadow-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95"
                        >
                          {buttonLabel}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 border-2 border-white shadow-sm">
                  <User size={16} className="text-gray-500" />
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Hiệu ứng AI đang gõ */}
      {isSending && (
         <div className="flex gap-3 text-sm mt-1 animate-fade-in-up">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0 shadow-sm">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-white border border-gray-200 px-4 py-3.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5 w-fit">
               <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
               <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
         </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}