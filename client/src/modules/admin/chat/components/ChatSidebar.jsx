// File: src/modules/admin/chat/components/ChatSidebar.jsx
import React from "react";
import { UserCircle } from "lucide-react";

export const ChatSidebar = ({ conversations, activeRoomId, onSelectRoom }) => {
    return (
        <div className="w-1/3 max-w-sm bg-slate-50 border-r border-slate-200 flex flex-col h-full">
            <div className="p-4 bg-white border-b border-slate-200 shrink-0">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Hội thoại hỗ trợ</h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {conversations.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-sm">Chưa có cuộc hội thoại nào.</div>
                ) : (
                    conversations.map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => onSelectRoom(conv.id)}
                            className={`p-4 border-b border-slate-100 cursor-pointer transition-all duration-200 flex gap-3 items-center ${
                                activeRoomId === conv.id 
                                    ? "bg-blue-50/50 border-l-4 border-l-blue-600" 
                                    : "hover:bg-slate-100 border-l-4 border-l-transparent"
                            }`}
                        >
                            <UserCircle className={`w-10 h-10 shrink-0 ${activeRoomId === conv.id ? 'text-blue-600' : 'text-slate-400'}`} />
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm text-slate-900 truncate">
                                    {conv.customerName || `Khách ẩn danh #${conv.guestId?.substring(0, 5)}`}
                                </div>
                                <div className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                                    {conv.lastMessage || "Đã gửi tệp đính kèm"}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};