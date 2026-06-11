package com.example.backend.controller.client;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.entity.ChatMessage;
import com.example.backend.entity.Conversation;
import com.example.backend.service.ChatService;
import com.example.backend.utils.SecurityUtils;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/init")
    public ResponseEntity<Conversation> initConversation(
            @RequestParam(required = false) String guestId, @RequestParam String customerName) {
        Integer currentUserId = SecurityUtils.getCurrentUserId();

        return ResponseEntity.ok(chatService.getOrCreateConversation(currentUserId, guestId, customerName));
    }

    @GetMapping("/{conversationId}/history")
    public ResponseEntity<List<ChatMessage>> getHistory(@PathVariable Integer conversationId) {
        return ResponseEntity.ok(chatService.getChatHistory(conversationId));
    }

    @GetMapping("/admin/list")
    public ResponseEntity<List<Conversation>> getAllConversationsForAdmin() {
        return ResponseEntity.ok(chatService.getAllConversationsForAdmin());
    }

    @PostMapping("/upload-images")
    public ResponseEntity<List<String>> uploadImages(@RequestParam("files") List<MultipartFile> files) {
        return ResponseEntity.ok(chatService.uploadChatImages(files));
    }
}
