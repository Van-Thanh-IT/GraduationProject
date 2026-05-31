// File: src/services/chat.service.js
import API from '@/api/API';

export const ChatService = {
  //CHAT AI
  getSessionsAI: (guestKey) => {
    return API.get('/api/public/chat/sessions', {
      headers: { 'X-Guest-Session-Key': guestKey }
    });
  },

  getMessagesAI: (sessionId) => {
    return API.get(`/api/public/chat/sessions/${sessionId}/messages`);
  },

  sendMessageAI: (payload, guestKey) => {
   
    return API.post('/api/public/chat', payload, {
      headers: { 'X-Guest-Session-Key': guestKey }
    });
  },

  //CHAT
    getConversations: () => {
    return API.get("/api/chat/admin/list");
  },

  getMessages: (roomId) => {
    return API.get(`/api/chat/${roomId}/history`);
  },

  uploadImages: (formData) => {
    return API.post("/api/chat/upload-images", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }, 
};
