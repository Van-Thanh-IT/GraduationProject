import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { ChatService } from "@/services/chat.service";
import { createSocketClient } from "@/services/socket.service";

export const useAdminChat = () => {
  const { getAccessToken } = useAuth();

  const [stompClient, setStompClient] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const currentSubscriptionRef = useRef(null);

  // INIT
  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    fetchConversations();

    const client = createSocketClient(token, handleIncomingGlobalMessage);
    client.activate();
    setStompClient(client);

    return () => client.deactivate();
  }, []);

  // API
  const fetchConversations = async () => {
    try {
      const res = await ChatService.getConversations();
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleIncomingGlobalMessage = (newMsg) => {
    setConversations((prev) => {
      const index = prev.findIndex((c) => c.id === newMsg.conversationId);
      let updated = [...prev];

      if (index > -1) {
        const room = { ...updated[index] };
        room.lastMessage = newMsg.content || "[Hình ảnh]";
        room.updatedAt = new Date().toISOString();

        updated.splice(index, 1);
        updated.unshift(room);
      } else {
        fetchConversations();
      }

      return updated;
    });
  };

  // Chọn phòng
  const selectRoom = async (roomId) => {
    setActiveRoomId(roomId);

    try {
      const res = await ChatService.getMessages(roomId);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }

    if (stompClient?.connected) {
      if (currentSubscriptionRef.current) {
        currentSubscriptionRef.current.unsubscribe();
      }

      const sub = stompClient.subscribe(
        `/topic/conversation/${roomId}`,
        (message) => {
          const msg = JSON.parse(message.body);
          setMessages((prev) => [...prev, msg]);
        }
      );

      currentSubscriptionRef.current = sub;
    }
  };

  // Gửi message
  const sendMessage = async (text, images) => {
    if (!stompClient?.connected || !activeRoomId) return;

    setIsUploading(true);
    let uploadedUrls = [];

    if (images.length > 0) {
      const formData = new FormData();
      images.forEach((f) => formData.append("files", f));

      try {
        const res = await ChatService.uploadImages(formData);
        uploadedUrls = res.data;
      } catch (err) {
        console.error(err);
        setIsUploading(false);
        return false;
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
    return true;
  };

  return {
    conversations,
    activeRoomId,
    messages,
    isUploading,
    selectRoom,
    sendMessage,
  };
};