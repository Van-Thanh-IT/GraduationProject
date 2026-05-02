// File: src/services/chat.service.js
import API from '@/api/API';

export const ChatService = {
  // 1. Lấy danh sách lịch sử chat
  getSessions: (guestKey) => {
    return API.get('/public/chat/sessions', {
      headers: { 'X-Guest-Session-Key': guestKey }
    });
  },

  // 2. Lấy tin nhắn của 1 phiên chat
  getMessages: (sessionId) => {
    return API.get(`/public/chat/sessions/${sessionId}/messages`);
  },

  // 3. Gửi tin nhắn mới cho AI
  sendMessage: (payload, guestKey) => {
   
    return API.post('/public/chat', payload, {
      headers: { 'X-Guest-Session-Key': guestKey }
    });
  }
};
