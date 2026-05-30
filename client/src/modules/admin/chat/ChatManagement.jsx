// File: src/modules/admin/chat/AdminChatBoard.jsx
import React, { useEffect, useRef } from "react";
import { MessageSquareOff, ChevronLeft } from "lucide-react";
import { useAdminChat } from "@/hooks/useAdminChat";
import { ChatSidebar } from "./components/ChatSidebar";
import { ChatInput } from "./components/ChatInput";

const ChatManagement = () => {
    const { conversations, activeRoomId, messages, isUploading, selectRoom, sendMessage } = useAdminChat();
    const messagesEndRef = useRef(null);

    // Tự động cuộn xuống cuối
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex h-[82vh] bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden font-sans relative w-full">
            
            {/* VÙNG SIDEBAR: Ẩn trên mobile nếu đang ở trong phòng chat */}
            <div className={`w-full md:w-1/3 md:max-w-sm shrink-0 border-r border-slate-200 flex-col h-full bg-slate-50 ${activeRoomId ? 'hidden md:flex' : 'flex'}`}>
                <ChatSidebar 
                    conversations={conversations} 
                    activeRoomId={activeRoomId} 
                    onSelectRoom={selectRoom} 
                />
            </div>

            {/* VÙNG CHAT: Ẩn trên mobile nếu chưa chọn phòng chat */}
            <div className={`flex-1 flex-col bg-slate-50 relative ${activeRoomId ? 'flex' : 'hidden md:flex'}`}>
                {activeRoomId ? (
                    <>
                        <div className="px-4 md:px-6 py-4 bg-white border-b border-slate-200 shadow-sm z-10 shrink-0 flex items-center gap-3">
                            {/* Nút Back (Chỉ hiện trên điện thoại) */}
                            <button 
                                onClick={() => selectRoom(null)}
                                className="md:hidden p-1.5 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <strong className="text-lg font-extrabold text-slate-800">
                                Phòng hỗ trợ #{activeRoomId}
                            </strong>
                        </div>

                        {/* Vùng hiển thị tin nhắn */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 custom-scrollbar">
                            {messages.map((msg, idx) => {
                                const isAdminMsg = msg.senderRole === "ADMIN" || msg.senderRole === "STAFF";
                                return (
                                    <div key={idx} className={`flex flex-col ${isAdminMsg ? "items-end" : "items-start"}`}>
                                        {!isAdminMsg && (
                                            <span className="text-[11px] font-bold text-slate-400 mb-1.5 ml-1 uppercase tracking-wider">
                                                {msg.senderRole}
                                            </span>
                                        )}

                                        {msg.content && (
                                            <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] md:max-w-[75%] text-[14px] md:text-[15px] leading-relaxed shadow-sm ${
                                                isAdminMsg 
                                                    ? "bg-blue-600 text-white rounded-tr-sm" 
                                                    : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
                                            }`}>
                                                {msg.content}
                                            </div>
                                        )}

                                        {msg.imageUrls && msg.imageUrls.length > 0 && (
                                            <div className={`flex flex-wrap gap-2 mt-2 max-w-[90%] md:max-w-[80%] ${isAdminMsg ? "justify-end" : "justify-start"}`}>
                                                {msg.imageUrls.map((url, imgIdx) => (
                                                    <img
                                                        key={imgIdx}
                                                        src={url}
                                                        alt="Đính kèm"
                                                        className="w-24 h-24 md:w-36 md:h-36 object-cover rounded-xl border border-slate-200 shadow-sm hover:opacity-90 cursor-pointer transition-opacity"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <ChatInput onSendMessage={sendMessage} isUploading={isUploading} />
                    </>
                ) : (
                    <div className="flex-1 flex flex-col justify-center items-center text-slate-400 bg-slate-50/50 p-6 text-center">
                        <MessageSquareOff className="w-16 h-16 md:w-20 md:h-20 mb-4 opacity-20" />
                        <h3 className="text-base md:text-lg font-bold text-slate-500">Chọn một đoạn chat để bắt đầu hỗ trợ</h3>
                        <p className="text-sm mt-2 font-medium">Tin nhắn từ khách hàng sẽ hiển thị ở đây.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatManagement;