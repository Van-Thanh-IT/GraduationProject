package com.example.backend.controller.client;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import com.example.backend.dto.request.ChatMessageRequest;
import com.example.backend.dto.response.UserPrincipal;
import com.example.backend.entity.ChatMessage;
import com.example.backend.exception.CustomException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.service.ChatService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageRequest request, Authentication authentication) {

        if (authentication != null
                && authentication.isAuthenticated()
                && !authentication.getPrincipal().equals("anonymousUser")) {
            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

            if (principal == null) {
                throw new CustomException(ErrorCode.AUTH_UNAUTHENTICATED);
            }
            request.setSenderIdentifier(String.valueOf(principal.getUserId()));
        }
        ChatMessage savedMessage = chatService.saveMessage(request);

        String roomTopic = "/topic/conversation/" + request.getConversationId();
        messagingTemplate.convertAndSend(roomTopic, savedMessage);

        messagingTemplate.convertAndSend("/topic/admin/updates", savedMessage);
    }
}
