// File: src/modules/admin/chat/hooks/useAdminChat.js
import { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useAuth } from "@/context/AuthContext";
import API from "@/api/API";

export const useAdminChat = () => {
    const { getAccessToken } = useAuth();
    const [stompClient, setStompClient] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [activeRoomId, setActiveRoomId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const currentSubscriptionRef = useRef(null);

    // Khởi tạo WebSocket & lấy danh sách chat
    useEffect(() => {
        const token = getAccessToken();
     
        if (!token) return;

        fetchConversations();

        const client = new Client({
            webSocketFactory: () => new SockJS(`http://localhost:8080/ws/chat`),
            connectHeaders: { Authorization: `Bearer ${token}` },
            debug: () => {}, 
            onConnect: () => {
                client.subscribe("/topic/admin/updates", (message) => {
                    const newMsg = JSON.parse(message.body);
                    handleIncomingGlobalMessage(newMsg);
                });
            },
            onStompError: (err) => console.error("Lỗi STOMP:", err),
        });

        client.activate();
        setStompClient(client);

        return () => client.deactivate();
    }, []);

    const fetchConversations = async () => {
        try {
            const res = await API.get("/chat/admin/list");
            setConversations(res.data);
        } catch (error) {
            console.error("Lỗi lấy danh sách chat:", error);
        }
    };

    const handleIncomingGlobalMessage = (newMsg) => {
        setConversations((prev) => {
            const existingRoomIndex = prev.findIndex((c) => c.id === newMsg.conversationId);
            let updatedList = [...prev];

            if (existingRoomIndex > -1) {
                let room = updatedList[existingRoomIndex];
                room.lastMessage = newMsg.content || "[Hình ảnh]";
                room.updatedAt = new Date().toISOString();
                updatedList.splice(existingRoomIndex, 1);
                updatedList.unshift(room);
            } else {
                fetchConversations();
            }
            return updatedList;
        });
    };

    const selectRoom = async (roomId) => {
        setActiveRoomId(roomId);
        try {
            const res = await API.get(`/chat/${roomId}/history`);
            setMessages(res.data);
        } catch (error) {
            console.error("Lỗi lấy lịch sử chat:", error);
        }

        if (stompClient?.connected) {
            if (currentSubscriptionRef.current) {
                currentSubscriptionRef.current.unsubscribe();
            }
            const sub = stompClient.subscribe(`/topic/conversation/${roomId}`, (message) => {
                const receivedMsg = JSON.parse(message.body);
                setMessages((prev) => [...prev, receivedMsg]);
            });
            currentSubscriptionRef.current = sub;
        }
    };

    const sendMessage = async (text, images) => {
        if (!stompClient?.connected || !activeRoomId) return;
        setIsUploading(true);
        let uploadedUrls = [];

        if (images.length > 0) {
            const formData = new FormData();
            images.forEach((file) => formData.append("files", file));
            try {
                const res = await API.post("/chat/upload-images", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                uploadedUrls = res.data;
            } catch (error) {
                console.error("Lỗi upload ảnh:", error);
                alert("Upload ảnh thất bại!");
                setIsUploading(false);
                return false; // Báo lỗi cho UI
            }
        }

        const payload = {
            conversationId: activeRoomId,
            senderRole: "ADMIN",
            senderIdentifier: "1",
            content: text,
            imageUrls: uploadedUrls,
        };

        stompClient.publish({
            destination: "/app/chat.sendMessage",
            body: JSON.stringify(payload),
        });

        setIsUploading(false);
        return true; // Thành công
    };

    return {
        conversations,
        activeRoomId,
        messages,
        isUploading,
        selectRoom,
        sendMessage
    };
};