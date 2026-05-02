package com.example.backend.controller.client;

import com.example.backend.dto.request.AIChatRequest;
import com.example.backend.dto.response.AIChatResponse;
import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.ChatSessionDTO;
import com.example.backend.service.ChatHistoryService;
import com.example.backend.service.GeminiChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/public/chat")
@RequiredArgsConstructor
public class AIChatController {

    private final GeminiChatService geminiChatService;
    private final ChatHistoryService chatHistoryService;

    // API 1: Lấy danh sách các cuộc hội thoại cũ
    @GetMapping("/sessions")
    public ResponseEntity<?> getSessions(
            @RequestHeader(value = "X-Guest-Session-Key", required = false) String guestSessionKey) {

        List<ChatSessionDTO> sessions = chatHistoryService.getUserSessions(guestSessionKey);

        return ResponseEntity.ok(Map.of(
                "code", 200,
                "messages", "Thành công",
                "data", sessions
        ));
    }

    // API 2: Lấy chi tiết tin nhắn của 1 phiên chat cụ thể
    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<?> getSessionMessages(@PathVariable UUID sessionId) {

        List<AIChatResponse> messages = chatHistoryService.getMessagesBySession(sessionId);

        return ResponseEntity.ok(Map.of(
                "code", 200,
                "messages", "Thành công",
                "data", messages
        ));
    }

    @PostMapping
    public APIResponse<AIChatResponse> chatWithAI(
            @RequestBody AIChatRequest request,
            @RequestHeader(value = "X-Guest-Session-Key", required = false) String guestSessionKey
    ) {
        AIChatResponse response = geminiChatService.processChat(request, guestSessionKey);

        return APIResponse.<AIChatResponse>builder()
                .code(200)
                .data(response)
                .messages("Thành công")
                .build();
    }
}