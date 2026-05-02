// File: src/components/FloatingChatBot/ChatHeader.jsx
import React from 'react';
import { Sparkles, MessageCircle, X } from 'lucide-react';
import iconChatAi from "@/assets/icons/icon-chat-ai.png"; // Import ảnh chuẩn

export default function ChatHeader({ onNewChat, onClose, onMouseDown }) {
  return (
    <div 
      onMouseDown={onMouseDown} 
      className="bg-gradient-to-r from-blue-600 to-cyan-500 p-4 flex items-center justify-between shrink-0 cursor-move select-none rounded-t-2xl"
    >
      <div className="flex items-center gap-3 text-white pointer-events-none">
        
        {/* 1. AVATAR AI VỚI CHẤM XANH ONLINE */}
        <div className="relative">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden border-2 border-white/40 shrink-0 p-0.5">
            {/* Sử dụng ảnh bạn đã import */}
            <img src={iconChatAi} alt="TechStore AI" className="w-full h-full object-contain" />
          </div>
          {/* Chấm xanh báo Online ở góc dưới */}
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-blue-500 rounded-full"></span>
        </div>

        {/* 2. TIÊU ĐỀ VÀ TRẠNG THÁI */}
        <div className="flex flex-col">
          <h3 className="font-bold text-[16px] leading-tight flex items-center gap-1.5 drop-shadow-sm">
            Trợ lý TechStore <Sparkles size={14} className="text-yellow-300" />
          </h3>
          <p className="text-[13px] text-blue-50 font-medium flex items-center gap-1.5 mt-0.5">
            {/* Chấm nhỏ nhấp nháy */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
            </span>
            Sẵn sàng hỗ trợ 24/7
          </p>
        </div>
      </div>
      
      {/* 3. CÁC NÚT THAO TÁC */}
      <div className="flex items-center gap-1 text-white" onMouseDown={(e) => e.stopPropagation()}>
        <button 
          title="Cuộc trò chuyện mới" 
          onClick={onNewChat} 
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/20 transition-all active:scale-95"
        >
          <MessageCircle size={18} />
        </button>
        <button 
          title="Đóng" 
          onClick={onClose} 
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/20 transition-all active:scale-95 hover:text-rose-200 hover:bg-rose-500/20"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}