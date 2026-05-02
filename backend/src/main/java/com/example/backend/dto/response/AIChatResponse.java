package com.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class AIChatResponse {
    private Long id;              // THÊM: Dùng làm key cho React
    private UUID sessionId;
    private String role;
    private String content;
    private Object attachment;
    private List<ActionItem> actions;
    private LocalDateTime createdAt; // THÊM: Để hiển thị giờ nhắn
}