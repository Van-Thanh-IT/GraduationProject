import React, { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { MessageCircle, X, Send, ImagePlus, Loader2, User, Smile } from "lucide-react";
import EmojiPicker from 'emoji-picker-react';
import { useAuth } from "@/context/AuthContext";
import API from "@/api/API";

const CustomerChatWidget = ({isOpen, onOpen, onClose}) => {
    const { user, isAuthenticated, getAccessToken } = useAuth();

    const [step, setStep] = useState("INIT");
    
    const [guestId] = useState(() => {
        let savedId = localStorage.getItem("chat_guest_id");
        if (!savedId) {
            savedId = "GUEST_" + Math.random().toString(36).substring(2, 8);
            localStorage.setItem("chat_guest_id", savedId);
        }
        return savedId;
    });
    const [customerName, setCustomerName] = useState("");
    const [roomId, setRoomId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [messageInput, setMessageInput] = useState("");
    const [selectedImages, setSelectedImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);

    const stompClientRef = useRef(null);
    const messagesEndRef = useRef(null);
    const emojiRef = useRef(null);

    useEffect(() => {
        if (isAuthenticated && user) {
            setCustomerName(user.username);
            if (isOpen && !roomId) {
                initializeChat(user.username);
            }
        }
    }, [isAuthenticated, user, isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    useEffect(() => {
        return () => disconnect();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiRef.current && !emojiRef.current.contains(event.target)) {
                setShowEmoji(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const initializeChat = async (nameToUse) => {
        setErrorMsg("");
        setIsUploading(true);

        try {
            const res = await API.post(`/chat/init?guestId=${guestId}&customerName=${encodeURIComponent(nameToUse)}`);
            const conversation = res.data;
            const newRoomId = conversation.id;
            
            setRoomId(newRoomId);
            setStep("CHAT");

            const historyRes = await API.get(`/chat/${newRoomId}/history`);
            setMessages(historyRes.data || []);

            connectWebSocket(newRoomId);

        } catch (error) {
            console.error("Lỗi khởi tạo chat:", error);
            setErrorMsg("Không thể khởi tạo phòng chat. Vui lòng thử lại sau!");
            setStep("INIT");
        } finally {
            setIsUploading(false);
        }
    };

    const connectWebSocket = (currentRoomId) => {
        const token = getAccessToken();
    
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const client = new Client({
            webSocketFactory: () => new SockJS("http://localhost:8080/ws/chat"),
            connectHeaders: headers,
            debug: () => {},
            onConnect: () => {
                setIsConnected(true);
                setErrorMsg("");
                
                client.subscribe(`/topic/conversation/${currentRoomId}`, (message) => {
                    setMessages((prev) => [...prev, JSON.parse(message.body)]);
                });
            },
            onStompError: () => setErrorMsg("Lỗi từ máy chủ chat!"),
            onWebSocketError: () => setErrorMsg("Lỗi kết nối mạng!"),
            onWebSocketClose: () => setIsConnected(false)
        });

        client.activate();
        stompClientRef.current = client;
    };

    const disconnect = () => {
        if (stompClientRef.current) stompClientRef.current.deactivate();
        setIsConnected(false);
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + selectedImages.length > 3) {
            alert("Tối đa 3 ảnh!");
            return;
        }
        setSelectedImages((prev) => [...prev, ...files].slice(0, 3));
        e.target.value = null;
    };

    const removeImage = (idxToRemove) => {
        setSelectedImages((prev) => prev.filter((_, idx) => idx !== idxToRemove));
    };

    const onEmojiClick = (emojiObject) => {
        setMessageInput((prevMsg) => prevMsg + emojiObject.emoji);
    };

    const sendMessage = async () => {
        if (!stompClientRef.current || !isConnected || !roomId) return;
        if (!messageInput.trim() && selectedImages.length === 0) return;

        setShowEmoji(false);
        setIsUploading(true);
        let uploadedUrls = [];

        if (selectedImages.length > 0) {
            const formData = new FormData();
            selectedImages.forEach((file) => formData.append("files", file));
            try {
                const res = await API.post("/chat/upload-images", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                uploadedUrls = res.data;
            } catch (error) {
                console.error("Upload failed", error);
                alert("Upload ảnh thất bại!");
                setIsUploading(false);
                return;
            }
        }

        const payload = {
            conversationId: roomId,
            senderRole: isAuthenticated ? "USER" : "GUEST",
            senderIdentifier: isAuthenticated ? user.id.toString() : guestId,
            content: messageInput,
            imageUrls: uploadedUrls
        };

        stompClientRef.current.publish({
            destination: "/app/chat.sendMessage",
            body: JSON.stringify(payload)
        });

        setMessageInput("");
        setSelectedImages([]);
        setIsUploading(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[999] font-sans">
            {!isOpen && (
                <button
                    onClick={() => onOpen()}
                    className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-blue-700 hover:scale-105 transition-all animate-bounce-short"
                >
                    <MessageCircle className="w-7 h-7" />
                </button>
            )}

            {isOpen && (
                <div className="w-[350px] sm:w-[380px] h-[550px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-slide-up">
                    
                    <div className="bg-blue-600 p-4 text-white flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <MessageCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base">Hỗ trợ trực tuyến</h3>
                                <p className="text-[11px] text-blue-100 opacity-90">
                                    {isConnected ? "🟢 Đang kết nối" : "⚪ Đang chờ..."}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => onClose()} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {errorMsg && (
                        <div className="bg-red-50 text-red-600 text-xs p-2 text-center border-b border-red-100 font-medium">
                            {errorMsg}
                        </div>
                    )}

                    {step === "INIT" ? (
                        <div className="flex-1 flex flex-col justify-center p-6 bg-gray-50 text-center">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <User className="w-8 h-8" />
                            </div>
                            <h4 className="text-gray-800 font-bold text-lg mb-2">Chào bạn! 👋</h4>
                            <p className="text-gray-500 text-sm mb-6">Vui lòng cho biết tên để chúng tôi xưng hô và hỗ trợ bạn tốt hơn nhé.</p>
                            
                            <input
                                type="text"
                                placeholder="Nhập tên của bạn..."
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && customerName.trim() && initializeChat(customerName)}
                                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 mb-4 transition-all"
                            />
                            <button
                                onClick={() => initializeChat(customerName)}
                                disabled={!customerName.trim() || isUploading}
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Bắt đầu Chat"}
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4 custom-scrollbar">
                                {messages.length === 0 ? (
                                    <div className="text-center text-gray-400 text-sm mt-10">
                                        Hãy gửi tin nhắn, tư vấn viên sẽ phản hồi bạn sớm nhất!
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isMyMsg = msg.senderRole === "GUEST" || msg.senderRole === "USER";
                                        
                                        return (
                                            <div key={idx} className={`flex flex-col ${isMyMsg ? "items-end" : "items-start"}`}>
                                                {!isMyMsg && <span className="text-[10px] text-gray-400 font-bold mb-1 ml-1">Tư vấn viên</span>}
                                                
                                                {msg.content && (
                                                    <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-[14px] shadow-sm ${
                                                        isMyMsg ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm"
                                                    }`}>
                                                        {msg.content}
                                                    </div>
                                                )}

                                                {msg.imageUrls && msg.imageUrls.length > 0 && (
                                                    <div className={`flex flex-wrap gap-1.5 mt-1.5 max-w-[85%] ${isMyMsg ? "justify-end" : "justify-start"}`}>
                                                        {msg.imageUrls.map((url, imgIdx) => (
                                                            <img key={imgIdx} src={url} alt="Đính kèm" className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-gray-200 shadow-sm" />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="bg-white border-t border-gray-100 p-3 shrink-0 relative">
                                {showEmoji && (
                                    <div ref={emojiRef} className="absolute bottom-[70px] left-3 z-50 shadow-2xl">
                                        <EmojiPicker 
                                            onEmojiClick={onEmojiClick} 
                                            searchPlaceHolder="Tìm biểu tượng..."
                                            width={300}
                                            height={400}
                                        />
                                    </div>
                                )}

                                {selectedImages.length > 0 && (
                                    <div className="flex gap-2 mb-2 overflow-x-auto p-1 custom-scrollbar">
                                        {selectedImages.map((file, idx) => (
                                            <div key={idx} className="relative shrink-0">
                                                <img src={URL.createObjectURL(file)} alt="preview" className="w-14 h-14 object-cover rounded-lg border border-gray-200" />
                                                <button onClick={() => removeImage(idx)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-end gap-2">
                                    <button 
                                        type="button"
                                        onClick={() => setShowEmoji(!showEmoji)}
                                        disabled={isUploading || !isConnected}
                                        className="p-2.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-full cursor-pointer transition-colors shrink-0 disabled:opacity-50"
                                    >
                                        <Smile className="w-5 h-5" />
                                    </button>

                                    <label className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full cursor-pointer transition-colors shrink-0">
                                        <ImagePlus className="w-5 h-5" />
                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} disabled={isUploading || !isConnected} />
                                    </label>

                                    <textarea
                                        rows={1}
                                        placeholder="Nhập tin nhắn..."
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                sendMessage();
                                            }
                                        }}
                                        disabled={isUploading || !isConnected}
                                        className="flex-1 max-h-24 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none custom-scrollbar"
                                    />

                                    <button
                                        onClick={sendMessage}
                                        disabled={isUploading || !isConnected || (!messageInput.trim() && selectedImages.length === 0)}
                                        className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 shrink-0 transition-colors"
                                    >
                                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomerChatWidget;