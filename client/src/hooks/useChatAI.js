// File: src/hooks/useChat.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatService } from '@/services/chat.service';

export const getGuestSessionKey = () => {
  let key = localStorage.getItem('GUEST_SESSION_KEY');
  if (!key) {
    key = 'guest_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('GUEST_SESSION_KEY', key);
  }
  return key;
};


export const useGetChatSessions = () => {
  const guestKey = getGuestSessionKey();
  
  return useQuery({
    queryKey: ['chat-sessions'],
    queryFn: () => ChatService.getSessionsAI(guestKey).then(res => res.data.data),
    staleTime: 5 * 60 * 1000, 
  });
};


export const useGetChatMessages = (sessionId) => {
  return useQuery({
    queryKey: ['chat-messages', sessionId],
    queryFn: () => ChatService.getMessagesAI(sessionId).then(res => res.data.data),
    enabled: !!sessionId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const guestKey = getGuestSessionKey();

  return useMutation({
    mutationFn: (payload) => ChatService.sendMessageAI(payload, guestKey),
    onSuccess: (res) => {
      const responseData = res.data.data;
      const sessionId = responseData.sessionId;

      queryClient.setQueryData(['chat-messages', sessionId], (oldMessages) => {
        if (!oldMessages) return [responseData];
        return [...oldMessages, responseData];
      });


      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    }
  });
};