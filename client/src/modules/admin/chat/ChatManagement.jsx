// File: src/modules/admin/chat/AdminChatBoard.jsx
import React, { useEffect, useRef } from "react";
import { MessageSquareOff } from "lucide-react";
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
        <div className="flex h-[82vh] bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden font-sans">
            
            <ChatSidebar 
                conversations={conversations} 
                activeRoomId={activeRoomId} 
                onSelectRoom={selectRoom} 
            />

            <div className="flex-1 flex flex-col bg-slate-50 relative">
                {activeRoomId ? (
                    <>
                        <div className="px-6 py-4 bg-white border-b border-slate-200 shadow-sm z-10 shrink-0">
                            <strong className="text-lg font-extrabold text-slate-800">
                                Phòng hỗ trợ #{activeRoomId}
                            </strong>
                        </div>

                        {/* Vùng hiển thị tin nhắn */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
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
                                            <div className={`px-4 py-2.5 rounded-2xl max-w-[75%] text-[15px] leading-relaxed shadow-sm ${
                                                isAdminMsg 
                                                    ? "bg-blue-600 text-white rounded-tr-sm" 
                                                    : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
                                            }`}>
                                                {msg.content}
                                            </div>
                                        )}

                                        {msg.imageUrls && msg.imageUrls.length > 0 && (
                                            <div className={`flex flex-wrap gap-2 mt-2 max-w-[80%] ${isAdminMsg ? "justify-end" : "justify-start"}`}>
                                                {msg.imageUrls.map((url, imgIdx) => (
                                                    <img
                                                        key={imgIdx}
                                                        src={url}
                                                        alt="Đính kèm"
                                                        className="w-28 h-28 sm:w-36 sm:h-36 object-cover rounded-xl border border-slate-200 shadow-sm hover:opacity-90 cursor-pointer transition-opacity"
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
                    <div className="flex-1 flex flex-col justify-center items-center text-slate-400 bg-slate-50/50">
                        <MessageSquareOff className="w-20 h-20 mb-4 opacity-20" />
                        <h3 className="text-lg font-bold text-slate-500">Chọn một đoạn chat để bắt đầu hỗ trợ</h3>
                        <p className="text-sm mt-2 font-medium">Tin nhắn từ khách hàng sẽ hiển thị ở đây.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatManagement;