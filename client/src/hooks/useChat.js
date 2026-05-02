// File: src/hooks/useChat.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatService } from '@/services/chat.service';

// =========================================================
// HÀM HỖ TRỢ: Tự động tạo mã Khách vãng lai (Guest Key)
// =========================================================
export const getGuestSessionKey = () => {
  let key = localStorage.getItem('GUEST_SESSION_KEY');
  if (!key) {
    // Tạo 1 chuỗi random độc nhất cho khách chưa login
    key = 'guest_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('GUEST_SESSION_KEY', key);
  }
  return key;
};

// =========================================================
// 1. HOOK: LẤY DANH SÁCH PHIÊN CHAT (SESSIONS)
// =========================================================
export const useGetChatSessions = () => {
  const guestKey = getGuestSessionKey();
  
  return useQuery({
    queryKey: ['chat-sessions'],
    queryFn: () => ChatService.getSessions(guestKey).then(res => res.data.data),
    // Tùy chọn: tự động gọi lại API sau mỗi 5 phút để cập nhật danh sách
    staleTime: 5 * 60 * 1000, 
  });
};

// =========================================================
// 2. HOOK: LẤY CHI TIẾT TIN NHẮN TRONG 1 PHIÊN CHAT
// =========================================================
export const useGetChatMessages = (sessionId) => {
  return useQuery({
    queryKey: ['chat-messages', sessionId],
    queryFn: () => ChatService.getMessages(sessionId).then(res => res.data.data),
    enabled: !!sessionId, // Chỉ gọi API nếu đã chọn 1 đoạn chat
  });
};
// =========================================================
// 3. HOOK: GỬI TIN NHẮN CHO AI
// =========================================================
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const guestKey = getGuestSessionKey();

  return useMutation({
    mutationFn: (payload) => ChatService.sendMessage(payload, guestKey),
    onSuccess: (res) => {
      const responseData = res.data.data;
      const sessionId = responseData.sessionId;

      // CÁCH TỐI ƯU: Đắp thẳng tin nhắn mới của AI vào kho dữ liệu hiện tại
      // giúp giao diện cập nhật ngay lập tức mà không cần đợi gọi lại API
      queryClient.setQueryData(['chat-messages', sessionId], (oldMessages) => {
        if (!oldMessages) return [responseData];
        return [...oldMessages, responseData];
      });

      // Ép load lại danh sách các phiên chat (để nó tự nhảy lên đầu hoặc đổi tên title)
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    }
  });
};