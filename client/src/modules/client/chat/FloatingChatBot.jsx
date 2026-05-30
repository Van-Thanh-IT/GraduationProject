import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useGetChatSessions, useGetChatMessages, useSendMessage } from '@/hooks/useChat';

import ChatHeader from './components/ChatHeader';
import ChatMessageList from './components/ChatMessageList';
import ChatInput from './components/ChatInput';
import iconChatAi from "@/assets/icons/icon-chat-ai.png";

export default function FloatingChatBot({isOpen, onOpen, onClose }) {
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [inputText, setInputText] = useState("");
  const [tempNewChatMsg, setTempNewChatMsg] = useState(null); 
  
  // ==========================================
  // LOGIC DRAG & DROP (KÉO THẢ)
  // ==========================================
  const [pos, setPos] = useState({ x: 0, y: 0 }); 
  const isDragging = useRef(false);
  const dragInfo = useRef({ startX: 0, startY: 0, currentX: 0, currentY: 0, hasDragged: false });

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Chỉ kéo bằng chuột trái
    isDragging.current = true;
    dragInfo.current = {
      startX: e.clientX,
      startY: e.clientY,
      currentX: pos.x,
      currentY: pos.y,
      hasDragged: false 
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - dragInfo.current.startX;
    const deltaY = e.clientY - dragInfo.current.startY;
    
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      dragInfo.current.hasDragged = true;
    }
    setPos({
      x: dragInfo.current.currentX + deltaX,
      y: dragInfo.current.currentY + deltaY,
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleBubbleClick = () => {
    if (dragInfo.current.hasDragged) {
      dragInfo.current.hasDragged = false; 
      return; 
    }
    setPos({ x: 0, y: 0 });
    onOpen(); 
  };

  const handleCloseChat = () => {
    setPos({ x: 0, y: 0 });
    onClose();
  };
  // ==========================================

  const queryClient = useQueryClient();
  const { data: sessions } = useGetChatSessions();
  const { data: messages, isLoading: isLoadingMessages } = useGetChatMessages(activeSessionId);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();

  useEffect(() => {
    if (sessions && sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId]);

  const handleSendMessage = (textToSend) => {
    if (!textToSend || !textToSend.trim() || isSending) return;
    const messageContent = textToSend.trim();

    const userOptimisticMsg = {
      id: `temp_${Date.now()}`,
      role: 'USER',
      content: messageContent,
      attachment: null,
      actions: null
    };

    if (activeSessionId) {
      queryClient.setQueryData(['chat-messages', activeSessionId], (old) => {
        return old ? [...old, userOptimisticMsg] : [userOptimisticMsg];
      });
    } else {
      setTempNewChatMsg(userOptimisticMsg);
    }

    setInputText(""); 

    sendMessage(
      { message: messageContent, sessionId: activeSessionId },
      {
        onSuccess: (res) => {
          const newSessionId = res?.data?.data?.sessionId;
          if (!activeSessionId && newSessionId) {
            setActiveSessionId(newSessionId);
            setTempNewChatMsg(null); 
          }
        }
      }
    );
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setTempNewChatMsg(null);
  };

  const displayMessages = activeSessionId ? messages : (tempNewChatMsg ? [tempNewChatMsg] : []);

  return (
    // ĐẶT VỊ TRÍ GỐC: Cách Top 40% màn hình, sát mí phải
    <div className="fixed top-[50vh] right-6 z-[9999] font-sans">
      
      {/* KHỐI KÉO THẢ TỔNG */}
      <div 
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }} 
        className="relative flex items-center justify-end"
      >
        
        {/* ================= KHUNG CHAT ================= */}
        {/* SỬ DỤNG absolute, top-1/2 và -translate-y-1/2 ĐỂ CANH GIỮA THEO CHIỀU DỌC */}
        <div 
          onMouseDown={handleMouseDown} 
          className={`absolute right-0 top-1/2 -translate-y-1/2 w-[90vw] sm:w-[450px] lg:w-[500px] h-[650px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transition-all duration-300 origin-right cursor-move
          ${isOpen ? 'scale-100 opacity-100 visible' : 'scale-0 opacity-0 invisible'}`}
        >
          <ChatHeader onNewChat={handleNewChat} onClose={handleCloseChat} />
          
          <div 
            onMouseDown={(e) => e.stopPropagation()} 
            className="flex-1 flex flex-col overflow-hidden cursor-default"
          >
            <ChatMessageList 
              messages={displayMessages} 
              isLoading={isLoadingMessages} 
              isSending={isSending} 
              onActionClick={handleSendMessage}
            />
            
            <ChatInput 
              inputText={inputText} 
              setInputText={setInputText} 
              onSend={() => handleSendMessage(inputText)} 
              isSending={isSending} 
            />
          </div>
        </div>

        {/* ================= NÚT BONG BÓNG ================= */}
        <button 
          onMouseDown={handleMouseDown}
          onClick={handleBubbleClick}
          className={`relative z-10 w-16 h-16 bg-white p-1 rounded-full shadow-[0_10px_25px_rgba(37,99,235,0.4)] flex items-center justify-center hover:scale-110 transition-all duration-300 group cursor-move
          ${isOpen ? 'scale-0 opacity-0 invisible' : 'scale-100 opacity-100 visible'}`}
        >
          <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20 duration-1000 pointer-events-none"></span>
          
          <img 
            src={iconChatAi}
            alt="Chat với AI" 
            className="w-full h-full object-contain relative z-10 pointer-events-none rounded-full"
          />
        </button>

      </div>
    </div>
  );
}