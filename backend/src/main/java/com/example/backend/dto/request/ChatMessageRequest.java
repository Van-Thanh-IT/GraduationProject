package com.example.backend.dto.request;

import com.example.backend.enums.SenderRole;
import lombok.Data;
import java.util.List;

@Data
public class ChatMessageRequest {
    private Integer conversationId;
    private SenderRole senderRole; // (ADMIN, STAFF, USER, GUEST)
    private String senderIdentifier; // (UserID hoặc Guest UUID)
    private String content; // Nội dung chữ
    private List<String> imageUrls; // Mảng link ảnh
}