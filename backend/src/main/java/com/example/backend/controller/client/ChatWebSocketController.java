package com.example.backend.controller.client;

import com.example.backend.dto.request.ChatMessageRequest;
import com.example.backend.dto.response.UserPrincipal; // <-- Import UserPrincipal của bạn
import com.example.backend.entity.ChatMessage;
import com.example.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication; // <-- Phải import cái này
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageRequest request, Authentication authentication) {
        // --- BẢO MẬT VÀ GÁN ID CHÍNH XÁC ---
        // Nếu là khách đã đăng nhập (User/Admin/Staff), Spring sẽ nhét thông tin vào 'authentication'
        if (authentication != null && authentication.isAuthenticated() && !authentication.getPrincipal().equals("anonymousUser")) {
            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

            // Dù Hacker có gửi JSON mạo danh ID người khác cũng sẽ bị ghi đè lại đúng ID của họ!
            request.setSenderIdentifier(String.valueOf(principal.getUserId()));
        }
        // 1. Lưu DB
        ChatMessage savedMessage = chatService.saveMessage(request);

        // 2. Phát sóng lại cho Khách & Admin đang ở trong phòng này
        String roomTopic = "/topic/conversation/" + request.getConversationId();
        messagingTemplate.convertAndSend(roomTopic, savedMessage);

        // 3. Bắn tin lên kênh tổng để cập nhật Sidebar (Tin nhắn cuối) cho các Admin khác
        messagingTemplate.convertAndSend("/topic/admin/updates", savedMessage);
    }
}